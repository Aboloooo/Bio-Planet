$(document).ready(function () {
  let products = [];
  let currentLang = "fr";
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
      sec: "Sec",
      etc: "Other",
      productsFound: "products found",
      productId: "Product ID:",
      category: "Category:",
      copy: "Copy",
      copied: "Copied!",
      loading: "Loading products...",
      loadError: "Error loading products. Please check data.json file.",
      noResults: "No products found.",
      noResultsHelp: "Try a different search or category.",
      productCardLabel: "Open details for",
      missingTitle: "Missing product?",
      missingHelp: "Leave a quick note and we will add it.",
      missingProductLabel: "Product name",
      missingDetailsLabel: "Details (optional)",
      missingSubmit: "Send note",
      missingSuccess: "Thanks. Your note has been saved.",
      missingError: "Could not save your note. Please try again.",
      missingRequired: "Please enter a product name.",
    },
    fr: {
      searchPlaceholder: "Rechercher par nom ou ID produit...",
      all: "Tous",
      fruits: "Fruits",
      vegetables: "Legumes",
      sweets: "Sucreries",
      bread: "Pain",
      nuts: "Noix",
      sec: "Sec",
      etc: "Autre",
      productsFound: "produits trouves",
      productId: "ID Produit:",
      category: "Categorie:",
      copy: "Copier",
      copied: "Copie!",
      loading: "Chargement des produits...",
      loadError:
        "Erreur de chargement des produits. Verifiez le fichier data.json.",
      noResults: "Aucun produit trouve.",
      noResultsHelp: "Essayez une autre recherche ou categorie.",
      productCardLabel: "Ouvrir les details pour",
      missingTitle: "Produit manquant ?",
      missingHelp: "Laissez une note et nous l'ajouterons rapidement.",
      missingProductLabel: "Nom du produit",
      missingDetailsLabel: "Details (optionnel)",
      missingSubmit: "Envoyer la note",
      missingSuccess: "Merci. Votre note a ete enregistree.",
      missingError: "Impossible d'enregistrer la note. Reessayez.",
      missingRequired: "Veuillez saisir un nom de produit.",
    },
    nl: {
      searchPlaceholder: "Zoek op productnaam of ID...",
      all: "Alle",
      fruits: "Fruit",
      vegetables: "Groenten",
      sweets: "Zoetigheden",
      bread: "Brood",
      nuts: "Noten",
      sec: "Sec",
      etc: "Overig",
      productsFound: "producten gevonden",
      productId: "Product ID:",
      category: "Categorie:",
      copy: "Kopieren",
      copied: "Gekopieerd!",
      loading: "Producten laden...",
      loadError: "Fout bij het laden van producten. Controleer data.json.",
      noResults: "Geen producten gevonden.",
      noResultsHelp: "Probeer een andere zoekopdracht of categorie.",
      productCardLabel: "Details openen voor",
      missingTitle: "Product ontbreekt?",
      missingHelp: "Laat een notitie achter en we voegen het toe.",
      missingProductLabel: "Productnaam",
      missingDetailsLabel: "Details (optioneel)",
      missingSubmit: "Notitie verzenden",
      missingSuccess: "Bedankt. Je notitie is opgeslagen.",
      missingError: "Notitie opslaan mislukt. Probeer opnieuw.",
      missingRequired: "Vul een productnaam in.",
    },
  };

  // Initialize
  loadProducts();
  setupEventListeners();
  updateLanguage();

  async function loadProducts() {
    try {
      $("#productGrid").html(
        '<div class="loading-state"></div><div class="loading-state"></div><div class="loading-state"></div><div class="loading-state"></div>',
      );
      const response = await fetch("data.json");
      products = await response.json();
      normalizeProductData();
      updateHeaderMeta();
      displayProducts();
    } catch (error) {
      console.error("Error loading products:", error);
      $("#productGrid").html(
        `<div class="error">${translations[currentLang].loadError}</div>`,
      );
    }
  }

  function displayProducts(filter = "") {
    const grid = $("#productGrid");
    grid.empty();

    let filtered = products;
    const normalizedFilter = filter.trim().toLowerCase();

    // Apply category filter
    if (currentCategory !== "all") {
      filtered = filtered.filter((p) => p.category === currentCategory);
    }

    // Apply search filter
    if (normalizedFilter) {
      filtered = filtered.filter(
        (p) =>
          p.searchName.includes(normalizedFilter) ||
          p.searchId.includes(normalizedFilter),
      );
    }

    // Update count
    $("#productCount").text(
      `${filtered.length} ${translations[currentLang].productsFound}`,
    );

    // Display products
    if (filtered.length === 0) {
      $("#missingNoteSection").prop("hidden", false);
      grid.html(
        `<div class="no-results"><strong>${translations[currentLang].noResults}</strong><span>${translations[currentLang].noResultsHelp}</span></div>`,
      );
      return;
    }

    $("#missingNoteSection").prop("hidden", true);

    filtered.forEach((product) => {
      const card = `
                <div class="product-card" data-id="${product.id}" role="button" tabindex="0" aria-label="${translations[currentLang].productCardLabel} ${product.name}">
                    <img src="products/${product.image}" alt="${product.name}" class="product-image" loading="lazy" decoding="async" width="320" height="180">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="card-id">ID: ${product.id}</div>
                    </div>
                </div>
            `;
      grid.append(card);
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
      translations[currentLang][product.category] || product.category,
    );

    $("#productModal").attr("aria-hidden", "false").fadeIn(200);
    $("body").css("overflow", "hidden");
    $(".close").trigger("focus");
  }

  function closeProductModal() {
    $("#productModal").attr("aria-hidden", "true").fadeOut(200);
    $("body").css("overflow", "auto");
    $("#searchInput").trigger("focus");
  }

  function updateHeaderMeta() {
    const now = new Date();
    $("#currentDate").text(now.toLocaleDateString(currentLang));
    $("#productCountHeader").text(
      `${products.length} ${translations[currentLang].productsFound}`,
    );
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
      updateHeaderMeta();
      displayProducts($("#searchInput").val());
    });

    // Product card open handlers
    $("#productGrid").on("click", ".product-card", function () {
      const id = $(this).data("id");
      showProductModal(id);
    });

    $("#productGrid").on("keydown", ".product-card", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = $(this).data("id");
        showProductModal(id);
      }
    });

    // Modal close
    $(".close, #productModal").on("click", function (e) {
      if ($(e.target).hasClass("modal") || $(e.target).hasClass("close")) {
        closeProductModal();
      }
    });

    // Copy ID button
    $("#copyIdBtn").on("click", function () {
      const id = $("#modalId").text();
      navigator.clipboard
        .writeText(id)
        .then(() => {
          const originalText = $(this).text();
          $(this).text(translations[currentLang].copied);
          setTimeout(() => {
            $(this).text(originalText);
          }, 2000);
        })
        .catch(() => {
          window.prompt(translations[currentLang].productId, id);
        });
    });

    // Keyboard shortcuts
    $(document).on("keydown", function (e) {
      // Escape closes modal
      if (e.key === "Escape" && $("#productModal").is(":visible")) {
        closeProductModal();
      }

      // Ctrl/Cmd + F focuses search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        $("#searchInput").focus();
      }
    });

    // Auto-focus search on page load
    setTimeout(() => $("#searchInput").focus(), 100);

    // Missing product note submit
    $("#missingNoteForm").on("submit", async function (e) {
      e.preventDefault();

      const product = $("#missingProductName").val().trim();
      const details = $("#missingProductDetails").val().trim();
      const statusEl = $("#missingNoteStatus");
      const submitBtn = $("#submitMissingNote");

      statusEl.removeClass("error").text("");

      if (!product) {
        statusEl
          .addClass("error")
          .text(translations[currentLang].missingRequired);
        return;
      }

      submitBtn.prop("disabled", true);

      try {
        const response = await fetch("save_note.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product,
            details,
            lang: currentLang,
          }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error("Save failed");
        }

        statusEl
          .removeClass("error")
          .text(translations[currentLang].missingSuccess);
        $("#missingNoteForm")[0].reset();
      } catch (error) {
        console.error("Error saving note:", error);
        statusEl.addClass("error").text(translations[currentLang].missingError);
      } finally {
        submitBtn.prop("disabled", false);
      }
    });
  }

  function updateLanguage() {
    // Update UI texts
    $("#searchInput").attr(
      "placeholder",
      translations[currentLang].searchPlaceholder,
    );
    $("#copyIdBtn").text(translations[currentLang].copy);
    $(".modal-info .label:first-child").text(
      translations[currentLang].productId + " ",
    );
    $(".product-category .label").text(
      translations[currentLang].category + " ",
    );
    $("#missingNoteTitle").text(translations[currentLang].missingTitle);
    $("#missingNoteHelp").text(translations[currentLang].missingHelp);
    $("#missingProductLabel").text(
      translations[currentLang].missingProductLabel,
    );
    $("#missingDetailsLabel").text(
      translations[currentLang].missingDetailsLabel,
    );
    $("#submitMissingNote").text(translations[currentLang].missingSubmit);

    // Update category buttons
    $('[data-category="all"]').text(translations[currentLang].all);
    $('[data-category="fruits"]').text(translations[currentLang].fruits);
    $('[data-category="vegetables"]').text(
      translations[currentLang].vegetables,
    );
    $('[data-category="sweets"]').text(translations[currentLang].sweets);
    $('[data-category="bread"]').text(translations[currentLang].bread);
    $('[data-category="nuts"]').text(translations[currentLang].nuts);
    $('[data-category="sec"]').text(translations[currentLang].sec);
    $('[data-category="etc"]').text(translations[currentLang].etc);
  }

  function normalizeProductData() {
    products = products.map((product) => ({
      ...product,
      searchName: String(product.name || "").toLowerCase(),
      searchId: String(product.id || "").toLowerCase(),
    }));
  }
});
