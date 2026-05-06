<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Find Bio-Planet product IDs by searching products and categories.">
    <title>Bio-Planet Product Finder</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>

<body>
    <div class="container">
        <!-- Shop Header -->
        <div class="shop-header">
            <div class="shop-title">
                <div class="shop-logo"><img src="./Images/Bio-Planet icon.png" width="110" height="100" alt="Bio-Planet logo" class="shop-logo-image"></div>
                <div>
                    <h1 class="shop-name">Bio-Planet</h1>
                    <div class="shop-subtitle">Product ID Finder</div>
                </div>
            </div>
            <div class="last-update">
                <span id="currentDate"></span><br>
                <span id="productCountHeader" aria-live="polite">Demo version</span>
            </div>
        </div>
        <!-- Language Selector -->
        <div class="language-selector">
            <button class="lang-btn" data-lang="en">EN</button>
            <button class="lang-btn active" data-lang="fr">FR</button>
            <button class="lang-btn" data-lang="nl">NL</button>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
            <label for="searchInput" class="sr-only">Search products</label>
            <input type="text" id="searchInput" placeholder="Search by product name or ID..." autocomplete="off" inputmode="search" enterkeyhint="search">
            <button id="openKeyboardBtn" class="keyboard-btn" aria-label="Open keyboard" title="Open keyboard">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
                    <rect x="4.5" y="8" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="7.5" y="8" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="10.5" y="8" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="13.5" y="8" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="16.5" y="8" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="4.5" y="11" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="7.5" y="11" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="10.5" y="11" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="13.5" y="11" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="16.5" y="11" width="1.8" height="1.8" rx="0.4" fill="currentColor"></rect>
                    <rect x="7.5" y="14" width="9.3" height="1.8" rx="0.6" fill="currentColor"></rect>
                </svg>
            </button>
            <button id="clearSearch" class="clear-btn" aria-label="Clear search">&times;</button>
        </div>
        <div id="keyboardStatus" class="keyboard-status" aria-live="polite"></div>

        <!-- Category Filter -->
        <div class="category-filter">
            <button class="category-btn active" data-category="all">All</button>
            <button class="category-btn" data-category="fruits">Fruits</button>
            <button class="category-btn" data-category="vegetables">Vegetables</button>
            <button class="category-btn" data-category="sweets">Sweets</button>
            <button class="category-btn" data-category="bread">Bread</button>
            <button class="category-btn" data-category="nuts">Nuts</button>
            <button class="category-btn" data-category="sec">Sec</button>
            <button class="category-btn" data-category="etc">Other</button>
        </div>

        <!-- Product Grid -->
        <div id="productGrid" class="product-grid">
            <!-- Products will be loaded here -->
        </div>

        <!-- Missing Product Note -->
        <div class="missing-note" id="missingNoteSection" hidden>
            <h3 id="missingNoteTitle">Produit manquant ?</h3>
            <p id="missingNoteHelp">Laissez une note et nous l'ajouterons rapidement.</p>
            <form id="missingNoteForm" class="missing-note-form">
                <label for="missingProductName" id="missingProductLabel">Nom du produit</label>
                <input type="text" id="missingProductName" name="product" maxlength="120" required>

                <label for="missingProductDetails" id="missingDetailsLabel">Details (optionnel)</label>
                <textarea id="missingProductDetails" name="details" rows="3" maxlength="500"></textarea>

                <button type="submit" id="submitMissingNote" class="note-btn">Envoyer la note</button>
                <span id="missingNoteStatus" class="note-status" aria-live="polite"></span>
            </form>
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalName" aria-hidden="true">
            <div class="modal-content">
                <button type="button" class="close" aria-label="Close product details">&times;</button>
                <div class="modal-body">
                    <img id="modalImage" src="" alt="">
                    <div class="modal-info">
                        <h2 id="modalName"></h2>
                        <div class="modal-id-row">
                            <span class="label">Product ID:</span>
                            <span id="modalId" class="id-value"></span>
                            <button id="copyIdBtn" class="copy-btn">Copy</button>
                        </div>
                        <div class="product-category">
                            <span class="label">Category:</span>
                            <span id="modalCategory"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats">
            <span id="productCount" aria-live="polite">0 products found</span>
        </div>
    </div>

    <script src="script.js"></script>
</body>

</html>