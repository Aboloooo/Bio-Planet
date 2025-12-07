$(document).ready(function () {
  // Show loading state
  $("body").removeClass("js-loading").addClass("js-loaded");
  init();
});

async function init() {
  try {
    await loadAndDisplayProducts();
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    $("#resultsCount").html(`
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading products</h3>
                <p>Please check:</p>
                <ul>
                    <li>Ensure DB/products.json exists</li>
                    <li>Check browser console for details</li>
                    <li>Try refreshing the page</li>
                </ul>
            </div>
        `);
  }
}

async function loadAndDisplayProducts() {
  console.log("Loading products from DB/products.json...");

  try {
    // Load the JSON file with error handling
    const response = await fetch("DB/products.json", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    console.log("Data received:", data);

    // Check if products array exists
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error("Invalid JSON structure: missing products array");
    }

    const products = data.products;
    console.log(`Loaded ${products.length} products`);

    // Store products globally for filtering
    window.allProducts = products;

    // Display all products initially
    displayProducts(products);

    // Update results count
    $("#resultsCount").text(`Found ${products.length} products`);

    return products;
  } catch (error) {
    console.error("Error loading products:", error);

    // Provide fallback data
    const fallbackProducts = getFallbackProducts();
    window.allProducts = fallbackProducts;
    displayProducts(fallbackProducts);
    $("#resultsCount").text(
      `Found ${fallbackProducts.length} products (using fallback data)`
    );

    // Show error message
    showErrorNotification(
      "Using fallback data - JSON file may be missing or invalid"
    );

    return fallbackProducts;
  }
}

function displayProducts(products) {
  console.log("Displaying products:", products);

  const container = $("#productsContainer");
  container.empty();

  // Safety check
  if (!products || !Array.isArray(products)) {
    container.html('<div class="error">Error: Invalid products data</div>');
    return;
  }

  if (products.length === 0) {
    container.html(`
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search term</p>
            </div>
        `);
    return;
  }

  products.forEach((product) => {
    // Validate product object
    if (!product || !product.id || !product.name) {
      console.warn("Invalid product:", product);
      return;
    }

    const card = $(`
            <div class="product-card" data-id="${product.id}">
                <div class="product-color" style="background: ${
                  product.color || "#2e7d32"
                }"></div>
                <h3>${product.name}</h3>
                <p><strong>Type:</strong> ${product.type || "N/A"}</p>
                <p><strong>Origin:</strong> ${product.origin || "N/A"}</p>
                <p><strong>Category:</strong> ${product.category || "N/A"}</p>
                <div class="product-id">${product.id}</div>
            </div>
        `);

    card.click(function () {
      selectProduct(product);
    });

    container.append(card);
  });
}

function selectProduct(product) {
  // Remove previous selection
  $(".product-card").removeClass("selected");

  // Add selection to clicked card
  $(`.product-card[data-id="${product.id}"]`).addClass("selected");

  // Show notification
  showNotification(`Selected: ${product.name} (ID: ${product.id})`);

  // Copy to clipboard
  copyToClipboard(product.id);
}

function filterProducts(searchTerm) {
  if (!window.allProducts || !Array.isArray(window.allProducts)) {
    console.error("No products available for filtering");
    return;
  }

  searchTerm = searchTerm.toLowerCase().trim();

  if (searchTerm === "") {
    displayProducts(window.allProducts);
    $("#resultsCount").text(`Found ${window.allProducts.length} products`);
    return;
  }

  const filtered = window.allProducts.filter((product) => {
    if (!product) return false;

    return (
      (product.name && product.name.toLowerCase().includes(searchTerm)) ||
      (product.type && product.type.toLowerCase().includes(searchTerm)) ||
      (product.id && product.id.toLowerCase().includes(searchTerm)) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm)) ||
      (product.origin && product.origin.toLowerCase().includes(searchTerm))
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

  // Clear search button
  $("#clearSearch").click(function () {
    $("#searchInput").val("");
    filterProducts("");
  });
}

function getFallbackProducts() {
  return [
    {
      id: "FP001",
      name: "Carrot",
      category: "vegetables",
      type: "Bio Organic",
      color: "#ff9800",
      origin: "Local Farm",
    },
    {
      id: "FP002",
      name: "Carrot",
      category: "vegetables",
      type: "European",
      color: "#ff5722",
      origin: "France",
    },
    {
      id: "FP003",
      name: "Tomato",
      category: "vegetables",
      type: "Cherry",
      color: "#f44336",
      origin: "Spain",
    },
  ];
}

function copyToClipboard(text) {
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => console.log("Copied:", text))
      .catch((err) => console.error("Copy failed:", err));
  } else {
    // Fallback method
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      console.log("Copied (fallback):", text);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }

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

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 3000);
}

function showErrorNotification(message) {
  const notification = $(`
        <div class="custom-notification error">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `);

  $("body").append(notification);

  setTimeout(() => {
    notification.fadeOut(300, function () {
      $(this).remove();
    });
  }, 5000);
}
