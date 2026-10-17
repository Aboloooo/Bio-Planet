<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

function respond($statusCode, $payload)
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function validDate($value)
{
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    return $date && $date->format('Y-m-d') === $value;
}

function writeBackupBundle($storageDirectory, $expiryEntries)
{
    $catalog = json_decode(file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'data.json'), true);
    if (!is_array($catalog)) {
        return false;
    }

    $backup = [
        'schemaVersion' => 1,
        'createdAtUtc' => gmdate('c'),
        'files' => [
            'data.json' => $catalog,
            'expiry_entries.json' => $expiryEntries,
        ],
    ];
    $backupFile = rtrim($storageDirectory, DIRECTORY_SEPARATOR)
        . DIRECTORY_SEPARATOR . 'backup.json';
    $tempFile = $backupFile . '.tmp.' . getmypid();
    $encoded = json_encode(
        $backup,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    ) . PHP_EOL;

    if (file_put_contents($tempFile, $encoded, LOCK_EX) === false || !rename($tempFile, $backupFile)) {
        @unlink($tempFile);
        return false;
    }

    @chmod($backupFile, 0640);
    return true;
}

$storageDirectory = getenv('BIOPLANET_DATA_DIR');
if (!$storageDirectory) {
    $storageDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'storage';
}

$storageFile = rtrim($storageDirectory, DIRECTORY_SEPARATOR)
    . DIRECTORY_SEPARATOR . 'expiry_entries.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $storageExists = is_file($storageFile);
    $storedEntries = $storageExists
        ? json_decode(file_get_contents($storageFile), true)
        : [];
    if (!is_array($storedEntries)) {
        respond(500, ['success' => false, 'message' => 'Expiry data file is invalid']);
    }

    if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0750, true) && !is_dir($storageDirectory)) {
        respond(500, ['success' => false, 'message' => 'Could not create expiry storage directory']);
    }
    if (!$storageExists && file_put_contents($storageFile, "[]\n", LOCK_EX) === false) {
        respond(500, ['success' => false, 'message' => 'Could not initialize expiry data file']);
    }
    if (!$storageExists) {
        @chmod($storageFile, 0640);
    }
    if (!writeBackupBundle($storageDirectory, $storedEntries)) {
        respond(500, ['success' => false, 'message' => 'Could not create combined backup file']);
    }

    respond(200, ['success' => true, 'exists' => $storageExists, 'entries' => $storedEntries]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['success' => false, 'message' => 'Method not allowed']);
}

$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > 2097152) {
    respond(413, ['success' => false, 'message' => 'Expiry data is too large']);
}

$request = json_decode($rawInput, true);
if (!is_array($request) || !isset($request['entries']) || !is_array($request['entries'])) {
    respond(400, ['success' => false, 'message' => 'Expected an entries array']);
}

if (count($request['entries']) > 10000) {
    respond(413, ['success' => false, 'message' => 'Too many expiry entries']);
}

$entries = [];
$seenIds = [];
foreach ($request['entries'] as $entry) {
    if (!is_array($entry)) {
        respond(422, ['success' => false, 'message' => 'Invalid expiry entry']);
    }

    $id = trim((string)($entry['id'] ?? ''));
    $rowNumber = trim((string)($entry['rowNumber'] ?? ''));
    $productName = trim((string)($entry['productName'] ?? ''));
    $productId = trim((string)($entry['productId'] ?? ''));
    $expiryDate = $entry['expiryDate'] ?? null;

    if (
        $id === '' || strlen($id) > 100 || isset($seenIds[$id]) ||
        !preg_match('/^[1-9]\d{0,2}$/', $rowNumber) || (int)$rowNumber > 170 ||
        $productName === '' || strlen($productName) > 640 ||
        $productId === '' || strlen($productId) > 320 ||
        !validDate($expiryDate)
    ) {
        respond(422, ['success' => false, 'message' => 'Expiry entry validation failed']);
    }

    $seenIds[$id] = true;
    $expiry = DateTimeImmutable::createFromFormat('!Y-m-d', $expiryDate);
    $updatedAt = trim((string)($entry['updatedAt'] ?? ''));
    if ($updatedAt === '' || strtotime($updatedAt) === false) {
        $updatedAt = gmdate('c');
    }

    $entries[] = [
        'id' => $id,
        'rowNumber' => $rowNumber,
        'productName' => $productName,
        'productId' => $productId,
        'expiryDate' => $expiryDate,
        'alertDate' => $expiry->modify('-10 days')->format('Y-m-d'),
        'collected' => ($entry['collected'] ?? false) === true,
        'removed' => ($entry['removed'] ?? false) === true,
        'updatedAt' => $updatedAt,
    ];
}

if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0750, true) && !is_dir($storageDirectory)) {
    respond(500, ['success' => false, 'message' => 'Could not create expiry storage directory']);
}

$lockHandle = fopen($storageFile . '.lock', 'c');
if ($lockHandle === false || !flock($lockHandle, LOCK_EX)) {
    respond(500, ['success' => false, 'message' => 'Could not lock expiry storage']);
}

$tempFile = $storageFile . '.tmp.' . getmypid();
$encoded = json_encode(
    $entries,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
) . PHP_EOL;
$writeSucceeded = file_put_contents($tempFile, $encoded, LOCK_EX) !== false;
if (!$writeSucceeded || !rename($tempFile, $storageFile)) {
    @unlink($tempFile);
    flock($lockHandle, LOCK_UN);
    fclose($lockHandle);
    respond(500, ['success' => false, 'message' => 'Could not save expiry data']);
}

@chmod($storageFile, 0640);
flock($lockHandle, LOCK_UN);
fclose($lockHandle);
if (!writeBackupBundle($storageDirectory, $entries)) {
    respond(500, ['success' => false, 'message' => 'Could not create combined backup file']);
}
respond(200, ['success' => true, 'count' => count($entries)]);
