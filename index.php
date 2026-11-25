<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Find Bio-Planet product IDs by searching products and categories.">
    <title>Bio-Planet · Outils magasin</title>
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
                    <div id="shopSubtitle" class="shop-subtitle">Product ID Finder</div>
                </div>
            </div>
            <nav class="app-switcher" role="tablist" aria-label="Choose app">
                <button id="finderTab" class="app-tab active" type="button" role="tab" aria-selected="true" aria-controls="finderPanel">
                    <span aria-hidden="true">🔍</span><span id="finderTabLabel">Product Finder</span>
                </button>
                <button id="expiryTab" class="app-tab" type="button" role="tab" aria-selected="false" aria-controls="expiryPanel" tabindex="-1">
                    <span aria-hidden="true">📅</span><span id="expiryTabLabel">Expiry Tracker</span>
                </button>
            </nav>
            <div class="language-selector" aria-label="Language">
                <button class="lang-btn" data-lang="en">EN</button>
                <button class="lang-btn active" data-lang="fr">FR</button>
                <button class="lang-btn" data-lang="nl">NL</button>
            </div>
            <div class="last-update">
                <span id="currentDate"></span><br>
                <span id="productCountHeader" aria-live="polite">Demo version</span>
            </div>
        </div>



        <div class="app-panels">
            <section id="finderPanel" class="finder-panel active" role="tabpanel" aria-label="Product ID Finder" tabindex="0">
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
                    <button class="category-btn active" data-category="all"><span class="chip-label">All</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="fruits"><span class="chip-label">Fruits</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="vegetables"><span class="chip-label">Vegetables</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="sweets"><span class="chip-label">Sweets</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="bread"><span class="chip-label">Bread</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="nuts"><span class="chip-label">Nuts</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="sec"><span class="chip-label">Sec</span><span class="chip-count"></span></button>
                    <button class="category-btn" data-category="etc"><span class="chip-label">Other</span><span class="chip-count"></span></button>
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

                <!-- Quick Stats -->
                <div class="stats">
                    <span id="productCount" aria-live="polite">0 products found</span>
                </div>
            </section>

            <section id="expiryPanel" class="expiry-panel" role="tabpanel" aria-labelledby="expiryTitle" tabindex="0" hidden>
                <div class="expiry-heading">
                    <div>
                        <p id="expiryEyebrow" class="expiry-eyebrow">Stock rotation</p>
                        <h2 id="expiryTitle">Expiry Date Tracker</h2>
                    </div>
                    <span id="expiryEntryCount" class="expiry-count">0 items</span>
                </div>

                <div id="expirySummary" class="summary-tiles" aria-live="polite"></div>

                <button id="collectionToggle" class="collection-toggle" type="button" aria-live="polite" aria-expanded="false" aria-controls="collectionPanel" disabled>
                    📋 Liste de collecte du jour (0)
                </button>
                <div id="expiryStorageError" class="expiry-alert-banner expiry-storage-error" role="alert" hidden></div>

                <section id="collectionPanel" class="collection-panel" aria-labelledby="collectionHeading" hidden>
                    <div class="collection-panel-heading">
                        <h3 id="collectionHeading">Liste de collecte du jour</h3>
                        <button id="closeCollectionPanel" class="collection-close" type="button" aria-label="Close collection list">Close</button>
                    </div>
                    <div id="collectionEntries" class="collection-entries"></div>
                    <p id="collectionEmptyState" class="collection-empty-state" hidden>No products to collect.</p>
                </section>

                <form id="expiryForm" class="expiry-form">
                    <div class="expiry-field">
                        <label id="expiryRowLabel" for="rowPickerTrigger">Row Number</label>
                        <input id="expiryRow" name="rowNumber" type="hidden" value="1">
                        <button id="rowPickerTrigger" class="row-picker-trigger" type="button" aria-haspopup="dialog" aria-controls="rowPickerOverlay">
                            <span id="rowNumberDisplay">1</span><span id="rowPickerHint" class="row-picker-hint">Choose row</span>
                        </button>
                    </div>

                    <div class="expiry-field">
                        <label id="expiryProductNameLabel" for="expiryProductName">Product Name</label>
                        <div class="touch-input-wrap">
                            <input id="expiryProductName" name="productName" type="text" inputmode="text" data-keyboard="text" maxlength="160" placeholder="e.g. Organic Milk" required>
                            <button class="touch-keyboard-trigger" type="button" data-keyboard-target="expiryProductName" aria-label="Open custom keyboard for product name" title="Open custom keyboard">⌨️</button>
                        </div>
                    </div>

                    <div class="expiry-field">
                        <label id="expiryProductIdLabel" for="expiryProductId">Product ID</label>
                        <div class="touch-input-wrap">
                            <input id="expiryProductId" name="productId" type="text" inputmode="numeric" data-keyboard="numeric" pattern="[0-9]+" maxlength="80" placeholder="e.g. 123456" required>
                            <button class="touch-keyboard-trigger" type="button" data-keyboard-target="expiryProductId" aria-label="Open numeric keypad for product ID" title="Open numeric keypad">⌨️</button>
                        </div>
                    </div>

                    <div class="expiry-field">
                        <label id="expiryDateLabel" for="expiryDate">Expiry Date</label>
                        <input id="expiryDate" name="expiryDate" type="text" inputmode="none" placeholder="Choose a date" readonly required aria-haspopup="dialog" aria-controls="expiryCalendar">
                    </div>

                    <button id="expirySaveButton" type="submit" class="expiry-save-btn">Add Product</button>
                </form>

                <div class="expiry-list-heading">
                    <div>
                        <h3 id="trackedProductsHeading">Tracked products</h3>
                        <span id="trackedProductsHelp">Alerts begin 10 days before expiry</span>
                    </div>
                    <button id="collectedFilterToggle" class="collected-filter-toggle" type="button">Show Collected</button>
                </div>
                <div class="expiry-table-wrap">
                    <table class="expiry-table">
                        <thead>
                            <tr>
                                <th id="expiryHeaderRow" scope="col">Row</th>
                                <th id="expiryHeaderName" scope="col">Product Name</th>
                                <th id="expiryHeaderId" scope="col">Product ID</th>
                                <th id="expiryHeaderDate" scope="col">Expiry Date</th>
                                <th id="expiryHeaderAlert" scope="col">Alert Date</th>
                                <th id="expiryHeaderStatus" scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody id="expiryEntries"></tbody>
                    </table>
                    <p id="expiryEmptyState" class="expiry-empty-state">No expiry dates recorded.</p>
                </div>
            </section>
        </div>

        <div id="touchKeyboard" class="touch-overlay" hidden>
            <section class="touch-keyboard" role="dialog" aria-modal="true" aria-labelledby="keyboardTitle">
                <div class="touch-overlay-heading">
                    <h2 id="keyboardTitle">On-screen keyboard</h2>
                    <button id="touchKeyboardCancel" class="touch-cancel" type="button" aria-label="Close without saving">✕</button>
                </div>
                <div id="keyboardPreview" class="keyboard-preview"><span id="keyboardTypingLabel">Typing:</span> <strong id="keyboardPreviewValue"></strong><span class="keyboard-caret" aria-hidden="true"></span></div>
                <div id="touchKeys" class="touch-keys"></div>
                <div class="touch-keyboard-footer">
                    <button id="keyboardLanguage" class="keyboard-language" type="button" hidden>EN</button>
                    <button id="touchKeyboardDone" class="touch-done" type="button">✓ Done</button>
                </div>
            </section>
        </div>

        <div id="rowPickerOverlay" class="touch-overlay" hidden>
            <section class="row-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="rowPickerTitle">
                <div class="touch-overlay-heading">
                    <h2 id="rowPickerTitle">Choose shelf row</h2>
                    <button id="rowPickerClose" class="touch-cancel" type="button" aria-label="Done">✓</button>
                </div>
                <div id="rowWheel" class="row-wheel" role="listbox" aria-label="Shelf row number" tabindex="0"></div>
                <p class="row-picker-selection"><span id="rowPickerSelectedLabel">Selected row</span> <strong id="rowPickerSelection">1</strong></p>
            </section>
        </div>

        <div id="expiryCalendar" class="touch-overlay" hidden>
            <section class="touch-calendar" role="dialog" aria-modal="true" aria-labelledby="calendarTitle">
                <div class="calendar-heading">
                    <button type="button" class="calendar-nav" data-calendar-move="-1" aria-label="Previous month">‹</button>
                    <h2 id="calendarTitle"></h2>
                    <button type="button" class="calendar-nav" data-calendar-move="1" aria-label="Next month">›</button>
                </div>
                <div class="calendar-weekdays" aria-hidden="true">
                    <span data-weekday="1">Mon</span><span data-weekday="2">Tue</span><span data-weekday="3">Wed</span><span data-weekday="4">Thu</span><span data-weekday="5">Fri</span><span data-weekday="6">Sat</span><span data-weekday="0">Sun</span>
                </div>
                <div id="calendarDays" class="calendar-days"></div>
                <button id="calendarCancelButton" type="button" class="calendar-cancel" data-calendar-action="close">Cancel</button>
            </section>
        </div>

        <div id="removeConfirmOverlay" class="touch-overlay" hidden>
            <section class="remove-confirm" role="dialog" aria-modal="true" aria-labelledby="removeConfirmTitle">
                <h2 id="removeConfirmTitle">Remove tracked product?</h2>
                <p id="removeConfirmMessage"></p>
                <div class="remove-confirm-actions">
                    <button id="cancelRemove" class="remove-cancel-btn" type="button">Cancel</button>
                    <button id="confirmRemove" class="remove-confirm-btn" type="button">🗑 Remove</button>
                </div>
            </section>
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalName" aria-hidden="true">
            <div class="modal-content">
                <button type="button" class="close" aria-label="Close product details">&times;</button>
                <div class="modal-body">
                    <img id="modalImage" src="" alt="">
                    <div class="modal-info">
                        <span id="modalCategory" class="category-tag"></span>
                        <h2 id="modalName"></h2>
                        <div class="modal-id-block">
                            <span class="label" id="modalIdLabel">Identifiant produit</span>
                            <span id="modalId" class="id-value"></span>
                        </div>
                        <p class="modal-hint" id="modalHint">Saisissez cet ID sur la balance ou à la caisse.</p>
                        <div class="modal-actions">
                            <button id="copyIdBtn" class="btn btn--primary btn-icon-copy" type="button">Copier l'ID</button>
                            <button id="addToTrackerBtn" class="btn btn--secondary btn-icon-calendar" type="button">Ajouter au suivi des dates</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast" role="status" aria-live="polite" hidden><span class="toast-check" aria-hidden="true"></span><span id="toastMessage"></span><button id="toastAction" class="toast-action" type="button" hidden></button></div>

    <script src="script.js"></script>
</body>

</html>