$(document).ready(function () {
  init();
});

async function init() {
  try {
    await loadAndDisplayProducts();
    setupEventListeners();
    updateCategoryStats();
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Error loading products. Please check console.");
  }
}

async function loadAndDisplayProducts() {
  console.log("Loading products from DB/products.json...");

  try {
    const response = await fetch("DB/products.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Data received:", data);

    // Convert your structure to a flat products array
    const products = convertToFlatArray(data);
    console.log(`Converted to ${products.length} products`);

    // Store products globally
    window.allProducts = products;
    window.originalData = data; // Keep original structure for stats

    displayProducts(products);
    $("#resultsCount").text(`Found ${products.length} products`);

    return products;
  } catch (error) {
    console.error("Error loading products:", error);

    // Fallback to sample data
    const fallbackProducts = getFallbackProducts();
    window.allProducts = fallbackProducts;
    displayProducts(fallbackProducts);
    $("#resultsCount").text(
      `Found ${fallbackProducts.length} products (using fallback)`
    );

    return fallbackProducts;
  }
}

function convertToFlatArray(data) {
  const products = [];

  // Loop through each category (Fruits, Vegetables, etc.)
  for (const category in data) {
    if (Array.isArray(data[category])) {
      data[category].forEach((item) => {
        // Add category to each item
        products.push({
          ...item,
          category: category.toLowerCase(),
          // Ensure id is string for consistency
          id: item.id.toString(),
        });
      });
    }
  }

  return products;
}

function displayProducts(products) {
  const container = $("#productsContainer");
  container.empty();

  if (!products || products.length === 0) {
    container.html(`
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `);
    return;
  }

  products.forEach((product) => {
    const card = $(`
            <div class="product-card" data-id="${product.id}" data-category="${
      product.category
    }">
                <div class="product-header">
                    <div class="product-color" style="background: ${getColorValue(
                      product.color
                    )}"></div>
                    <span class="product-category-badge">${
                      product.category
                    }</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-details">
                    <p><i class="fas fa-tag"></i> ID: <strong>${
                      product.id
                    }</strong></p>
                    <p><i class="fas fa-palette"></i> Color: ${
                      product.color
                    }</p>
                    ${
                      product.price
                        ? `<p><i class="fas fa-euro-sign"></i> Price: €${product.price}</p>`
                        : ""
                    }
                    ${
                      product.image
                        ? `<p><i class="fas fa-image"></i> Has image</p>`
                        : ""
                    }
                </div>
                <button class="select-product-btn">
                    <i class="fas fa-mouse-pointer"></i> Select Product
                </button>
            </div>
        `);

    card.find(".select-product-btn").click((e) => {
      e.stopPropagation();
      selectProduct(product);
    });

    container.append(card);
  });
}

function getColorValue(colorName) {
  // Convert color names to hex values
  const colorMap = {
    red: "#f44336",
    yellow: "#ffeb3b",
    orange: "#ff9800",
    green: "#4caf50",
    blue: "#2196f3",
    purple: "#9c27b0",
    brown: "#795548",
    white: "#ffffff",
    black: "#000000",
  };

  return colorMap[colorName.toLowerCase()] || "#cccccc";
}

function selectProduct(product) {
  // Remove previous selection
  $(".product-card").removeClass("selected");

  // Add selection to clicked card
  $(`.product-card[data-id="${product.id}"]`).addClass("selected");

  // Show selected product details
  showSelectedProduct(product);

  // Copy ID to clipboard
  copyToClipboard(product.id);

  // Show notification
  showNotification(
    `Selected: ${product.name} (ID: ${product.id}) - Copied to clipboard!`
  );
}

function showSelectedProduct(product) {
  const details = $(`
        <div class="selected-product-details">
            <div class="selected-header">
                <div class="selected-color" style="background: ${getColorValue(
                  product.color
                )}"></div>
                <div>
                    <h3>${product.name}</h3>
                    <span class="category-badge">${product.category}</span>
                </div>
            </div>
            <div class="selected-info">
                <div class="info-item">
                    <i class="fas fa-barcode"></i>
                    <div>
                        <label>Product ID</label>
                        <div class="product-id-display">${product.id}</div>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-palette"></i>
                    <div>
                        <label>Color</label>
                        <div>${product.color}</div>
                    </div>
                </div>
                ${
                  product.price
                    ? `
                <div class="info-item">
                    <i class="fas fa-euro-sign"></i>
                    <div>
                        <label>Price</label>
                        <div>€${product.price}</div>
                    </div>
                </div>
                `
                    : ""
                }
                <div class="info-item">
                    <i class="fas fa-layer-group"></i>
                    <div>
                        <label>Category</label>
                        <div>${product.category}</div>
                    </div>
                </div>
            </div>
            <button class="copy-id-btn" onclick="copyToClipboard('${
              product.id
            }')">
                <i class="fas fa-copy"></i> Copy ID Again
            </button>
        </div>
    `);

  $(".selected-details").html(details);
}

function updateCategoryStats() {
  if (!window.originalData) return;

  let totalCount = 0;
  const stats = {};

  for (const category in window.originalData) {
    if (Array.isArray(window.originalData[category])) {
      const count = window.originalData[category].length;
      stats[category] = count;
      totalCount += count;
    }
  }

  // Update stats display
  $("#total-count").text(totalCount);

  for (const category in stats) {
    $(`#${category.toLowerCase()}-count`).text(stats[category]);
  }
}

function filterProducts(searchTerm) {
  if (!window.allProducts) return;

  searchTerm = searchTerm.toLowerCase().trim();

  if (searchTerm === "") {
    displayProducts(window.allProducts);
    $("#resultsCount").text(`Found ${window.allProducts.length} products`);
    return;
  }

  const filtered = window.allProducts.filter((product) => {
    return (
      (product.name && product.name.toLowerCase().includes(searchTerm)) ||
      (product.id && product.id.toLowerCase().includes(searchTerm)) ||
      (product.color && product.color.toLowerCase().includes(searchTerm)) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  });

  displayProducts(filtered);
  $("#resultsCount").text(`Found ${filtered.length} products`);
}

function setupEventListeners() {
  // Search functionality
  $("#searchInput").on("input", function () {
    filterProducts($(this).val());
  });

  // Category filter buttons
  $(".category-btn").click(function () {
    const category = $(this).data("category");
    filterByCategory(category);
  });

  // Clear filters
  $("#clearFilters").click(() => {
    $("#searchInput").val("");
    $(".category-btn").removeClass("active");
    $('.category-btn[data-category="all"]').addClass("active");
    displayProducts(window.allProducts);
    $("#resultsCount").text(`Found ${window.allProducts.length} products`);
  });
}

function filterByCategory(category) {
  if (!window.allProducts) return;

  $(".category-btn").removeClass("active");
  $(`.category-btn[data-category="${category}"]`).addClass("active");

  if (category === "all") {
    displayProducts(window.allProducts);
    $("#resultsCount").text(`Found ${window.allProducts.length} products`);
    return;
  }

  const filtered = window.allProducts.filter(
    (product) => product.category === category
  );

  displayProducts(filtered);
  $("#resultsCount").text(`Found ${filtered.length} products`);
}

// Helper functions
function copyToClipboard(text) {
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

function showNotification(message) {
  // Remove existing notification
  $(".custom-notification").remove();

  const notification = $(`
        <div class="custom-notification">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `);

  $("body").append(notification);

  setTimeout(() => {
    notification.fadeOut(300, () => notification.remove());
  }, 3000);
}

function showError(message) {
  $("#resultsCount").html(`
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>${message}</h4>
        </div>
    `);
}

function getFallbackProducts() {
  return [
    {
      id: "1",
      name: "Apple",
      category: "fruits",
      color: "Red",
      price: 1.2,
    },
    {
      id: "2",
      name: "Banana",
      category: "fruits",
      color: "Yellow",
      price: 0.5,
    },
    {
      id: "3",
      name: "Carrot",
      category: "vegetables",
      color: "Orange",
      price: 0.8,
    },
  ];
}
