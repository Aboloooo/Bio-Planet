<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bio-Planet | Product Finder</title>
    <link rel="stylesheet" href="./Style/Style.css">
    <script src="./JS/jquery-3.6.3.min.js"></script>
    <script src="./JS/scriptV.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Add this right after <head> -->
    <script>
        // Debug helper
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, checking JSON file...');

            // Test if file exists
            fetch('DB/products.json')
                .then(response => {
                    console.log('JSON fetch status:', response.status);
                    console.log('JSON fetch ok:', response.ok);
                    return response.text();
                })
                .then(text => {
                    console.log('Raw JSON text (first 500 chars):', text.substring(0, 500));
                    try {
                        const json = JSON.parse(text);
                        console.log('JSON parsed successfully');
                        console.log('JSON structure:', json);
                    } catch (e) {
                        console.error('JSON parse error:', e);
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        });
    </script>
</head>


<body>
    <div class="main-body">
        <div class="main-container">
            <!-- Header -->
            <header class="header">
                <h1><i class="fas fa-leaf"></i> Bio-Planet Product Finder</h1>
                <p class="subtitle">Find your product ID instantly with smart filtering</p>
            </header>

            <!-- Quick Stats -->
            <div class="stats-bar">
                <div class="stat">
                    <i class="fas fa-apple-alt"></i>
                    <span>Fruits: <span id="fruits-count">0</span></span>
                </div>
                <div class="stat">
                    <i class="fas fa-carrot"></i>
                    <span>Vegetables: <span id="vegetables-count">0</span></span>
                </div>
                <div class="stat">
                    <i class="fas fa-bread-slice"></i>
                    <span>Breads: <span id="breads-count">0</span></span>
                </div>
                <div class="stat">
                    <i class="fas fa-cookie-bite"></i>
                    <span>Sweets: <span id="sweets-count">0</span></span>
                </div>
            </div>

            <!-- Main Content -->
            <div class="content-wrapper">
                <!-- Left Panel: Filters -->
                <div class="filter-panel">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchInput" placeholder="Search by name, type, ID...">
                        <button id="clearSearch"><i class="fas fa-times"></i></button>
                    </div>

                    <div class="filter-section">
                        <h3><i class="fas fa-filter"></i> Filter by Category</h3>
                        <div class="category-filters">
                            <button class="category-btn active" data-category="all">All Products</button>
                            <button class="category-btn" data-category="fruits">
                                <i class="fas fa-apple-alt"></i> Fruits
                            </button>
                            <button class="category-btn" data-category="vegetables">
                                <i class="fas fa-carrot"></i> Vegetables
                            </button>
                            <button class="category-btn" data-category="breads">
                                <i class="fas fa-bread-slice"></i> Breads
                            </button>
                            <button class="category-btn" data-category="sweets">
                                <i class="fas fa-cookie-bite"></i> Sweets
                            </button>
                        </div>
                    </div>

                    <div class="filter-section">
                        <h3><i class="fas fa-tags"></i> Quick Filter by Name</h3>
                        <div class="quick-filters" id="quickFilters">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>

                    <div class="filter-section">
                        <h3><i class="fas fa-palette"></i> Filter by Color</h3>
                        <div class="color-filters">
                            <button class="color-btn" data-color="all" style="background: linear-gradient(45deg, #ff9800, #4caf50, #2196f3, #9c27b0);">All Colors</button>
                            <button class="color-btn" data-color="#ff9800" style="background: #ff9800">Orange</button>
                            <button class="color-btn" data-color="#4caf50" style="background: #4caf50">Green</button>
                            <button class="color-btn" data-color="#f44336" style="background: #f44336">Red</button>
                            <button class="color-btn" data-color="#ffd600" style="background: #ffd600">Yellow</button>
                        </div>
                    </div>

                    <div class="sort-section">
                        <h3><i class="fas fa-sort-amount-down"></i> Sort By</h3>
                        <select id="sortSelect">
                            <option value="name">Name A-Z</option>
                            <option value="name_desc">Name Z-A</option>
                            <option value="id">ID Ascending</option>
                            <option value="id_desc">ID Descending</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                </div>

                <!-- Right Panel: Results -->
                <div class="results-panel">
                    <div class="results-header">
                        <h3>Products Found: <span id="resultsCount">0</span></h3>
                        <div class="view-controls">
                            <button class="view-btn active" data-view="grid"><i class="fas fa-th"></i></button>
                            <button class="view-btn" data-view="list"><i class="fas fa-list"></i></button>
                        </div>
                    </div>

                    <!-- Product Display Area -->
                    <div class="products-container grid-view" id="productsContainer">
                        <!-- Products will be loaded here -->
                    </div>

                    <!-- Selected Product Details -->
                    <div class="selected-product" id="selectedProduct">
                        <div class="selected-header">
                            <h3><i class="fas fa-info-circle"></i> Selected Product</h3>
                            <button id="copyIdBtn"><i class="fas fa-copy"></i> Copy ID</button>
                        </div>
                        <div class="selected-details">
                            <div class="placeholder">
                                <i class="fas fa-mouse-pointer"></i>
                                <p>Click on any product to see details here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick ID Display -->
            <div class="quick-id-display" id="quickIdDisplay">
                <div class="quick-id-content">
                    <span class="quick-id-label">Quick ID:</span>
                    <span class="quick-id-value" id="quickIdValue">None</span>
                    <button class="quick-copy-btn" id="quickCopyBtn">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Success Notification -->
    <div class="notification" id="notification">
        <i class="fas fa-check-circle"></i>
        <span>Product ID copied to clipboard!</span>
    </div>

</body>

</html>