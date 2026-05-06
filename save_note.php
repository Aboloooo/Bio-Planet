<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body']);
    exit;
}

$product = trim((string)($data['product'] ?? ''));
$details = trim((string)($data['details'] ?? ''));
$lang = trim((string)($data['lang'] ?? 'fr'));

if ($product === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Product is required']);
    exit;
}

if (strlen($product) > 120 || strlen($details) > 500) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Input too long']);
    exit;
}

$timestamp = date('Y-m-d H:i:s');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$line = sprintf(
    "[%s] lang=%s | product=%s | details=%s | ip=%s%s",
    $timestamp,
    str_replace(["\r", "\n"], ' ', $lang),
    str_replace(["\r", "\n"], ' ', $product),
    str_replace(["\r", "\n"], ' ', $details),
    str_replace(["\r", "\n"], ' ', $clientIp),
    PHP_EOL
);

$targetFile = __DIR__ . DIRECTORY_SEPARATOR . 'missing_products_notes.txt';
$writeResult = @file_put_contents($targetFile, $line, FILE_APPEND | LOCK_EX);

if ($writeResult === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not write note']);
    exit;
}

echo json_encode(['success' => true]);
