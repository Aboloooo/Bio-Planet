$(document).ready(function () {
  let products = [];
  let currentLang = "en";
  let currentCategory = "all";

  // Translations
  const translations = {
    en: {
      searchPlaceholder: "Search by product name or ID...",
      all: "All",
      fruits: "Fruits",
      vegetables: "Vegetables",
      sweets: "Sweets",
      bread: "Bread",
      nuts: "Nuts",
      etc: "Other",
      productsFound: "products found",
      productId: "Product ID:",
      category: "Category:",
      copy: "Copy",
    },
    fr: {
      searchPlaceholder: "Rechercher par nom ou ID produit...",
      all: "Tous",
      fruits: "Fruits",
      vegetables: "Légumes",
      sweets: "Sucreries",
      bread: "Pain",
      nuts: "Noix",
      etc: "Autre",
      productsFound: "produits trouvés",
      productId: "ID Produit:",
      category: "Catégorie:",
      copy: "Copier",
    },
    nl: {
      searchPlaceholder: "Zoek op productnaam of ID...",
      all: "Alle",
      fruits: "Fruit",
      vegetables: "Groenten",
      sweets: "Zoetigheden",
      bread: "Brood",
      nuts: "Noten",
      etc: "Overig",
      productsFound: "producten gevonden",
      productId: "Product ID:",
      category: "Categorie:",
      copy: "Kopiëren",
    },
  };

  // Initialize
  loadProducts();
  setupEventListeners();
  updateLanguage();

  async function loadProducts() {
    try {
      const response = await fetch("data.json");
      products = await response.json();
      displayProducts();
    } catch (error) {
      console.error("Error loading products:", error);
      $("#productGrid").html(
        '<div class="error">Error loading products. Please check data.json file.</div>'
      );
    }
  }

  function displayProducts(filter = "") {
    const grid = $("#productGrid");
    grid.empty();

    let filtered = products;

    // Apply category filter
    if (currentCategory !== "all") {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    // Apply search filter
    if (filter) {
      const searchLower = filter.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower)
      );
    }

    // Update count
    $("#productCount").text(
      `${filtered.length} ${translations[currentLang].productsFound}`
    );

    // Display products
    if (filtered.length === 0) {
      grid.html(
        '<div class="no-results">No products found. Try a different search.</div>'
      );
      return;
    }

    filtered.forEach((product) => {
      const card = `
                <div class="product-card" data-id="${product.id}">
                    <img src="products/${product.image}" alt="${product.name}" class="product-image" 
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-id">ID: ${product.id}</div>
                    </div>
                </div>
            `;
      grid.append(card);
    });

    // Add click event to each card
    $(".product-card").on("click", function () {
      const id = $(this).data("id");
      showProductModal(id);
    });
  }

  function showProductModal(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    $("#modalImage")
      .attr("src", `products/${product.image}`)
      .attr("alt", product.name);
    $("#modalName").text(product.name);
    $("#modalId").text(product.id);
    $("#modalCategory").text(
      translations[currentLang][product.category] || product.category
    );

    $("#productModal").fadeIn(200);
    $("body").css("overflow", "hidden");
  }

  function setupEventListeners() {
    // Search input
    $("#searchInput").on("input", function () {
      displayProducts($(this).val());
    });

    // Clear search
    $("#clearSearch").on("click", function () {
      $("#searchInput").val("").focus();
      displayProducts();
    });

    // Category filter
    $(".category-btn").on("click", function () {
      $(".category-btn").removeClass("active");
      $(this).addClass("active");
      currentCategory = $(this).data("category");
      displayProducts($("#searchInput").val());
    });

    // Language switcher
    $(".lang-btn").on("click", function () {
      $(".lang-btn").removeClass("active");
      $(this).addClass("active");
      currentLang = $(this).data("lang");
      updateLanguage();
      displayProducts($("#searchInput").val());
    });

    // Modal close
    $(".close, #productModal").on("click", function (e) {
      if ($(e.target).hasClass("modal") || $(e.target).hasClass("close")) {
        $("#productModal").fadeOut(200);
        $("body").css("overflow", "auto");
      }
    });

    // Copy ID button
    $("#copyIdBtn").on("click", function () {
      const id = $("#modalId").text();
      navigator.clipboard.writeText(id).then(() => {
        const originalText = $(this).text();
        $(this).text("Copied!");
        setTimeout(() => {
          $(this).text(originalText);
        }, 2000);
      });
    });

    // Keyboard shortcuts
    $(document).on("keydown", function (e) {
      // Escape closes modal
      if (e.key === "Escape") {
        $("#productModal").fadeOut(200);
        $("body").css("overflow", "auto");
      }

      // Ctrl/Cmd + F focuses search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        $("#searchInput").focus();
      }
    });

    // Auto-focus search on page load
    setTimeout(() => $("#searchInput").focus(), 100);
  }

  function updateLanguage() {
    // Update UI texts
    $("#searchInput").attr(
      "placeholder",
      translations[currentLang].searchPlaceholder
    );
    $("#copyIdBtn").text(translations[currentLang].copy);
    $(".modal-info .label:first-child").text(
      translations[currentLang].productId + " "
    );
    $(".product-category .label").text(
      translations[currentLang].category + " "
    );

    // Update category buttons
    $('[data-category="all"]').text(translations[currentLang].all);
    $('[data-category="fruits"]').text(translations[currentLang].fruits);
    $('[data-category="vegetables"]').text(
      translations[currentLang].vegetables
    );
    $('[data-category="sweets"]').text(translations[currentLang].sweets);
    $('[data-category="bread"]').text(translations[currentLang].bread);
    $('[data-category="nuts"]').text(translations[currentLang].nuts);
    $('[data-category="etc"]').text(translations[currentLang].etc);
  }
});
