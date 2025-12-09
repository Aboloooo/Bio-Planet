<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bio-Planet Product Finder</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>

<body>
    <div class="container">
        <!-- Shop Header -->
        <div class="shop-header">
            <div class="shop-title">
                <div class="shop-logo"><img src="../Images/Bio-Planet-logo.jpg" width="80px" height="80px"></div>
                <div>
                    <h1 class="shop-name">Bio-Planet</h1>
                    <div class="shop-subtitle">Product ID Finder</div>
                </div>
            </div>
            <div class="last-update">
                <span id="currentDate"></span><br>
                <span id="productCountHeader">Loading products...</span>
            </div>
        </div>
        <!-- Language Selector -->
        <div class="language-selector">
            <button class="lang-btn active" data-lang="en">EN</button>
            <button class="lang-btn" data-lang="fr">FR</button>
            <button class="lang-btn" data-lang="nl">NL</button>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Search by product name or ID..." autocomplete="off">
            <button id="clearSearch" class="clear-btn">×</button>
        </div>

        <!-- Category Filter -->
        <div class="category-filter">
            <button class="category-btn active" data-category="all">All</button>
            <button class="category-btn" data-category="fruits">Fruits</button>
            <button class="category-btn" data-category="vegetables">Vegetables</button>
            <button class="category-btn" data-category="sweets">Sweets</button>
            <button class="category-btn" data-category="bread">Bread</button>
            <button class="category-btn" data-category="nuts">Nuts</button>
            <button class="category-btn" data-category="etc">Other</button>
        </div>

        <!-- Product Grid -->
        <div id="productGrid" class="product-grid">
            <!-- Products will be loaded here -->
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-body">
                    <img id="modalImage" src="" alt="">
                    <div class="modal-info">
                        <h2 id="modalName"></h2>
                        <div class="product-id">
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
            <span id="productCount">0 products found</span>
        </div>
    </div>

    <script src="script.js"></script>
</body>

</html>