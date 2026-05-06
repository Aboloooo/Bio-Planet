$(document).ready(function () {
  let products = [];
  let currentLang = "fr";
  let currentCategory = "all";
  let keyboardStatusTimeoutId = null;

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
      openKeyboard: "Open keyboard",
      keyboardNoTouch:
        "No touch input detected. On-screen keyboard usually stays hidden when a physical keyboard is available.",
      keyboardNoApi:
        "This browser does not support direct virtual keyboard control. Tap the search field to trigger the system keyboard.",
      keyboardBlocked:
        "The browser blocked opening the virtual keyboard API on this device.",
      keyboardRequested:
        "Keyboard request sent. If no keyboard appears, check your device touch keyboard settings.",
      keyboardLikelySetting:
        "Input is focused, but keyboard did not open. The system touch keyboard setting is likely disabled.",
      keyboardFocusFailed:
        "Could not focus the search field. Please tap directly inside the field.",
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
      openKeyboard: "Ouvrir le clavier",
      keyboardNoTouch:
        "Aucun mode tactile detecte. Le clavier virtuel reste souvent masque si un clavier physique est disponible.",
      keyboardNoApi:
        "Ce navigateur ne prend pas en charge le controle direct du clavier virtuel. Touchez le champ de recherche pour ouvrir le clavier systeme.",
      keyboardBlocked:
        "Le navigateur a bloque l'ouverture du clavier virtuel sur cet appareil.",
      keyboardRequested:
        "Demande d'ouverture envoyee. Si le clavier n'apparait pas, verifiez les parametres du clavier tactile.",
      keyboardLikelySetting:
        "Le champ est actif, mais le clavier ne s'ouvre pas. Le parametre clavier tactile du systeme est probablement desactive.",
      keyboardFocusFailed:
        "Impossible d'activer le champ de recherche. Touchez directement le champ.",
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
      openKeyboard: "Toetsenbord openen",
      keyboardNoTouch:
        "Geen aanraakinvoer gedetecteerd. Het schermtoetsenbord blijft meestal verborgen wanneer een fysiek toetsenbord beschikbaar is.",
      keyboardNoApi:
        "Deze browser ondersteunt geen directe bediening van het virtuele toetsenbord. Tik op het zoekveld om het systeemtoetsenbord te openen.",
      keyboardBlocked:
        "De browser heeft het openen van het virtuele toetsenbord op dit apparaat geblokkeerd.",
      keyboardRequested:
        "Toetsenbordaanvraag verzonden. Als er niets verschijnt, controleer de instellingen van het schermtoetsenbord.",
      keyboardLikelySetting:
        "Het invoerveld heeft focus, maar het toetsenbord opent niet. De systeeminstelling voor het schermtoetsenbord is waarschijnlijk uitgeschakeld.",
      keyboardFocusFailed:
        "Het zoekveld kon geen focus krijgen. Tik direct in het veld.",
    },
  };

  function showKeyboardStatus(message, type = "info") {
    const status = $("#keyboardStatus");

    if (keyboardStatusTimeoutId) {
      clearTimeout(keyboardStatusTimeoutId);
      keyboardStatusTimeoutId = null;
    }

    status.removeClass("info success warning error");
    status.addClass(type).text(message);

    keyboardStatusTimeoutId = setTimeout(() => {
      status.removeClass("info success warning error").text("");
      keyboardStatusTimeoutId = null;
    }, 7000);
  }

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
          <div class="product-card" data-id="${product.id}" role="button" tabindex="0" aria-label="${translations[currentLang].productCardLabel} ${product.displayName}">
            <img src="products/${product.image}" alt="${product.displayName}" class="product-image" loading="lazy" decoding="async" width="320" height="180">
                    <div class="product-info">
              <div class="product-name">${product.displayName}</div>
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
      .attr("alt", product.displayName);
    $("#modalName").text(product.displayName);
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

    // Open virtual keyboard on touch devices when available.
    $("#openKeyboardBtn").on("click", function () {
      const input = document.getElementById("searchInput");
      if (!input) return;

      const isTouchDevice =
        (navigator.maxTouchPoints || 0) > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

      const initialViewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      input.focus({ preventScroll: true });
      input.click();

      if (document.activeElement !== input) {
        showKeyboardStatus(translations[currentLang].keyboardFocusFailed, "error");
        return;
      }

      if (!isTouchDevice) {
        showKeyboardStatus(translations[currentLang].keyboardNoTouch, "warning");
        return;
      }

      if (
        navigator.virtualKeyboard &&
        typeof navigator.virtualKeyboard.show === "function"
      ) {
        try {
          navigator.virtualKeyboard.show();
          showKeyboardStatus(translations[currentLang].keyboardRequested, "info");

          setTimeout(() => {
            if (!window.visualViewport) {
              return;
            }

            const heightChange = initialViewportHeight - window.visualViewport.height;
            if (heightChange < 80 && document.activeElement === input) {
              showKeyboardStatus(
                translations[currentLang].keyboardLikelySetting,
                "warning",
              );
            }
          }, 700);
        } catch (error) {
          showKeyboardStatus(translations[currentLang].keyboardBlocked, "error");
        }
      } else {
        showKeyboardStatus(translations[currentLang].keyboardNoApi, "warning");
      }
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
    $("#openKeyboardBtn")
      .attr("aria-label", translations[currentLang].openKeyboard)
      .attr("title", translations[currentLang].openKeyboard);

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
    const smartTitleCase = (value) => {
      const cleaned = String(value || "")
        .trim()
        .replace(/\s+/g, " ");

      return cleaned
        .split(" ")
        .map((token) => {
          // Keep short uppercase product codes like BPX, EU, BIO.
          if (/^[A-Z0-9]{2,4}$/.test(token)) {
            return token;
          }

          return token
            .toLowerCase()
            .split("-")
            .map((part) =>
              part
                .split("'")
                .map((piece) =>
                  piece ? piece.charAt(0).toUpperCase() + piece.slice(1) : piece,
                )
                .join("'"),
            )
            .join("-");
        })
        .join(" ");
    };

    products = products.map((product) => ({
      ...product,
      displayName: smartTitleCase(product.name),
      searchName: String(product.name || "").toLowerCase(),
      searchId: String(product.id || "").toLowerCase(),
    }));
  }
});
