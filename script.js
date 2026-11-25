// Short feedback message at the bottom of the screen (optionally with an undo-style action).
window.bpToast = (function () {
  let timer = null;
  return function (message, action) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const actionBtn = document.getElementById("toastAction");
    document.getElementById("toastMessage").textContent = message;
    actionBtn.hidden = !action;
    actionBtn.onclick = null;
    if (action) {
      actionBtn.textContent = action.label;
      actionBtn.onclick = () => {
        toast.hidden = true;
        action.onClick();
      };
    }
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => (toast.hidden = true), action ? 6000 : 4000);
  };
})();

// Search bar: slide away when scrolling down, come back when scrolling up.
(function () {
  let lastY = window.scrollY;
  let ticking = false;
  const setHeaderHeight = () => {
    const header = document.querySelector(".shop-header");
    if (header) document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
    const sw = document.querySelector(".app-switcher");
    if (sw) document.documentElement.style.setProperty("--switcher-h", `${sw.offsetHeight}px`);
  };
  const update = () => {
    ticking = false;
    const sw = document.querySelector(".app-switcher");
    if (sw) {
      const headerH = document.querySelector(".shop-header")?.offsetHeight || 76;
      const stuck = window.scrollY > 4 && sw.getBoundingClientRect().top <= headerH + 1;
      sw.classList.toggle("is-stuck", stuck);
      document.documentElement.style.setProperty("--switcher-h", `${sw.offsetHeight}px`);
    }
    const bar = document.querySelector(".search-container");
    const finder = document.getElementById("finderPanel");
    if (!bar || !finder || finder.hidden) return;
    const y = window.scrollY;
    const delta = y - lastY;
    if (y < 120 || delta < -4) bar.classList.remove("is-hidden"); // near the top, or scrolling up: show
    else if (delta > 4) bar.classList.add("is-hidden"); // scrolling down: hide
    lastY = y;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", setHeaderHeight);
  document.addEventListener("DOMContentLoaded", setHeaderHeight);
  // Typing in the search should always keep it visible.
  document.addEventListener("focusin", (e) => {
    if (e.target && e.target.id === "searchInput") document.querySelector(".search-container")?.classList.remove("is-hidden");
  });
})();

$(document).ready(function () {
  let products = [];
  let currentLang = "fr";
  let currentCategory = "all";
  let keyboardStatusTimeoutId = null;

  // Translations
  const translations = {
    en: {
      searchPlaceholder: "Search by product name or ID...",
      idLabel: "Product ID",
      idCopied: (id) => `ID ${id} copied`,
      copyId: "Copy ID",
      copyIdLabel: (id) => `Copy ID ${id}`,
      addToTracker: "Add to expiry tracker",
      hint: "Enter this ID on the scale or at the till.",
      noId: "ID missing",
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
      searchPlaceholder: "Rechercher un produit ou un ID…",
      idLabel: "Identifiant produit",
      idCopied: (id) => `ID ${id} copié`,
      copyId: "Copier l'ID",
      copyIdLabel: (id) => `Copier l'ID ${id}`,
      addToTracker: "Ajouter au suivi des dates",
      hint: "Saisissez cet ID sur la balance ou à la caisse.",
      noId: "ID manquant",
      all: "Tous",
      fruits: "Fruits",
      vegetables: "Légumes",
      sweets: "Sucreries",
      bread: "Pain",
      nuts: "Noix",
      sec: "Sec",
      etc: "Autre",
      productsFound: "produits trouvés",
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
      idLabel: "Product-ID",
      idCopied: (id) => `ID ${id} gekopieerd`,
      copyId: "ID kopiëren",
      copyIdLabel: (id) => `ID ${id} kopiëren`,
      addToTracker: "Toevoegen aan vervaldatums",
      hint: "Voer deze ID in op de weegschaal of aan de kassa.",
      noId: "ID ontbreekt",
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
      updateCategoryCounts();
      updateHeaderMeta();
      displayProducts();
    } catch (error) {
      console.error("Error loading products:", error);
      $("#productGrid").html(
        `<div class="error">${translations[currentLang].loadError}</div>`,
      );
    }
  }

  // Lowercase, strip accents (é -> e, ç -> c, ë -> e...) and collapse spaces,
  // so "cerise" matches "cérises" and "chene" matches "chêne".
  function normalizeForSearch(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function displayProducts(filter = "") {
    const grid = $("#productGrid");
    grid.empty();

    let filtered = products;
    const normalizedFilter = normalizeForSearch(filter);

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
      const t = translations[currentLang];
      const hasId = product.id && product.id !== "#";
      const card = `
          <div class="product-card" data-id="${product.id}" role="button" tabindex="0" aria-label="${product.displayName}, ID ${hasId ? product.id : t.noId}">
            <img src="products/${product.image}" alt="${product.displayName}" class="product-image" loading="lazy" decoding="async" width="320" height="240">
            <div class="product-info">
              <div class="product-name">${product.displayName}</div>
              <div class="card-id-box">
                <span class="card-id-label">ID</span>
                <span class="card-id">${hasId ? product.id : t.noId}</span>
                <button type="button" class="card-copy-btn" data-copy-id="${product.id}" aria-label="${t.copyIdLabel(product.id)}" ${hasId ? "" : "disabled"}></button>
              </div>
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

  function copyProductId(id) {
    if (!id || id === "#") return;
    const done = () => window.bpToast(translations[currentLang].idCopied(id));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(done).catch(() => {
        window.prompt(translations[currentLang].productId, id);
      });
    } else {
      window.prompt(translations[currentLang].productId, id);
    }
  }

  function updateCategoryCounts() {
    $(".category-btn").each(function () {
      const cat = $(this).data("category");
      const n = cat === "all" ? products.length : products.filter((p) => p.category === cat).length;
      $(this).find(".chip-count").text(n);
    });
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
        showKeyboardStatus(
          translations[currentLang].keyboardFocusFailed,
          "error",
        );
        return;
      }

      if (!isTouchDevice) {
        showKeyboardStatus(
          translations[currentLang].keyboardNoTouch,
          "warning",
        );
        return;
      }

      if (
        navigator.virtualKeyboard &&
        typeof navigator.virtualKeyboard.show === "function"
      ) {
        try {
          navigator.virtualKeyboard.show();
          showKeyboardStatus(
            translations[currentLang].keyboardRequested,
            "info",
          );

          setTimeout(() => {
            if (!window.visualViewport) {
              return;
            }

            const heightChange =
              initialViewportHeight - window.visualViewport.height;
            if (heightChange < 80 && document.activeElement === input) {
              showKeyboardStatus(
                translations[currentLang].keyboardLikelySetting,
                "warning",
              );
            }
          }, 700);
        } catch (error) {
          showKeyboardStatus(
            translations[currentLang].keyboardBlocked,
            "error",
          );
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
    $("#productGrid").on("click", ".card-copy-btn", function (e) {
      e.stopPropagation();
      copyProductId(String($(this).attr("data-copy-id")));
    });

    $("#productGrid").on("click", ".product-card", function () {
      // attr() keeps the ID as a string; .data() would turn "80231" into a number and the lookup would fail.
      const id = String($(this).attr("data-id"));
      showProductModal(id);
    });

    $("#productGrid").on("keydown", ".product-card", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = String($(this).attr("data-id"));
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
      copyProductId($("#modalId").text());
    });

    // Open the expiry tracker with this product already filled in.
    $("#addToTrackerBtn").on("click", function () {
      const name = $("#modalName").text();
      const id = $("#modalId").text();
      closeProductModal();
      document.getElementById("expiryTab").click();
      $("#expiryProductName").val(name);
      $("#expiryProductId").val(/^\d+$/.test(id) ? id : "");
      setTimeout(() => document.getElementById("expiryDate").focus(), 50);
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
    $("#copyIdBtn").text(translations[currentLang].copyId);
    $("#addToTrackerBtn").text(translations[currentLang].addToTracker);
    $("#modalIdLabel").text(translations[currentLang].idLabel);
    $("#modalHint").text(translations[currentLang].hint);
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
    $('[data-category="all"] .chip-label').text(translations[currentLang].all);
    $('[data-category="fruits"] .chip-label').text(translations[currentLang].fruits);
    $('[data-category="vegetables"] .chip-label').text(
      translations[currentLang].vegetables,
    );
    $('[data-category="sweets"] .chip-label').text(translations[currentLang].sweets);
    $('[data-category="bread"] .chip-label').text(translations[currentLang].bread);
    $('[data-category="nuts"] .chip-label').text(translations[currentLang].nuts);
    $('[data-category="sec"] .chip-label').text(translations[currentLang].sec);
    $('[data-category="etc"] .chip-label').text(translations[currentLang].etc);
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
                  piece
                    ? piece.charAt(0).toUpperCase() + piece.slice(1)
                    : piece,
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
      searchName: normalizeForSearch(product.name),
      searchId: normalizeForSearch(product.id),
    }));
  }
});

// Expiry tracking is isolated from the product finder and uses localStorage only.
(() => {
  const STORAGE_KEY = "bioPlanetExpiryEntries";
  const ALERT_LEAD_DAYS = 10;
  const form = document.getElementById("expiryForm");
  if (!form) return;

  const entriesBody = document.getElementById("expiryEntries");
  const emptyState = document.getElementById("expiryEmptyState");
  const entryCount = document.getElementById("expiryEntryCount");
  const collectedFilterToggle = document.getElementById(
    "collectedFilterToggle",
  );
  const collectionToggle = document.getElementById("collectionToggle");
  const collectionPanel = document.getElementById("collectionPanel");
  const collectionEntries = document.getElementById("collectionEntries");
  const collectionEmptyState = document.getElementById("collectionEmptyState");
  const collectionHeading = document.getElementById("collectionHeading");
  const storageError = document.getElementById("expiryStorageError");
  const removeConfirmOverlay = document.getElementById("removeConfirmOverlay");
  const removeConfirmMessage = document.getElementById("removeConfirmMessage");
  let pendingRemoveId = null;
  const recentlyCollected = new Set();
  let showCollected = false;

  const labels = {
    en: {
      locale: "en-GB",
      finderTab: "Product Finder",
      finderSubtitle: "Product ID Finder",
      chooseApp: "Choose app",
      trackerTab: "Expiry Tracker",
      trackerSubtitle: "Expiry Date Tracker",
      trackerTitle: "Expiry Date Tracker",
      eyebrow: "Stock rotation",
      rowNumber: "Row Number",
      chooseRow: "Enter number",
      productName: "Product Name",
      productNamePlaceholder: "e.g. Organic Milk",
      productId: "Product ID",
      productIdPlaceholder: "e.g. 123456",
      expiryDate: "Expiry Date",
      expiryDatePlaceholder: "Choose a date",
      addProduct: "Add Product",
      trackedProducts: "Tracked products",
      trackedProductsHelp: "Alerts start 10 days before expiry",
      showCollected: "Show Collected",
      hideCollected: "Hide Collected",
      tableHeaders: [
        "Row",
        "Product Name",
        "Product ID",
        "Expiry Date",
        "Alert Date",
        "Status",
      ],
      typing: "Typing:",
      keyboardGenericTitle: "On-screen keyboard",
      keyboardTitle: (name) => `Enter ${name}`,
      openTextKeyboard: "Open custom keyboard for product name",
      openNumberKeyboard: "Open numeric keypad for product ID",
      keyboardCancel: "Close without saving",
      keyboardDone: "✓ Done",
      keyboardDoneLabel: "Done",
      keyboardLanguageLabel: "Change keyboard language",
      keyboardShiftLabel: "Toggle uppercase",
      keyboardBackspaceLabel: "Backspace",
      deleteKey: "DEL",
      space: "Space",
      rowPickerTitle: "Choose shelf row",
      rowPickerDone: "Done",
      rowPickerLabel: "Shelf row number",
      rowPickerSelected: "Selected row",
      calendarPrevious: "Previous month",
      calendarNext: "Next month",
      calendarCancel: "Cancel",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      toggle: (count) => `📋 View Today's Collection List (${count})`,
      heading: "Today's Collection List",
      closePanel: "Close",
      empty: "No products to collect.",
      collected: "✅ COLLECTED",
      collect: "🔴 COLLECT NOW",
      soon: "🟡 EXPIRING SOON",
      expired: "⚫ EXPIRED",
      ok: "🟢 OK",
      markCollected: "✅ Mark as Collected",
      markedCollected: "✅ Collected",
      remove: "🗑 Remove",
      removeLabel: (name) => `Remove ${name} from expiry tracker`,
      removeTitle: "Remove tracked product?",
      removePrompt: (name) =>
        `Remove ${name} from active tracking? A history record will be kept.`,
      cancel: "Cancel",
      confirmRemove: "🗑 Remove",
      fields: [
        "Row",
        "Product Name",
        "Product ID",
        "Expiry Date",
        "Days Remaining",
      ],
      days: (count) => `${count} day${count === 1 ? "" : "s"} remaining`,
      overdue: (count) => `${count} day${count === 1 ? "" : "s"} overdue`,
      items: (count) => `${count} ${count === 1 ? "item" : "items"}`,
      noEntries: "No expiry dates recorded.",
      noVisibleEntries: "No collected entries are currently shown.",
      storageError: "Expiry entries could not be saved in this browser.",
      serverSyncError:
        "Expiry entries are saved locally, but the server JSON file could not be updated.",
    },
    fr: {
      locale: "fr-BE",
      finderTab: "Recherche de produits",
      finderSubtitle: "Recherche d'ID produit",
      chooseApp: "Choisir une application",
      trackerTab: "Suivi des dates",
      trackerSubtitle: "Suivi des dates d'expiration",
      trackerTitle: "Suivi des dates d'expiration",
      eyebrow: "Rotation du stock",
      rowNumber: "Numéro de rangée",
      chooseRow: "Saisir le numéro",
      productName: "Nom du produit",
      productNamePlaceholder: "ex. Lait bio",
      productId: "ID produit",
      productIdPlaceholder: "ex. 123456",
      expiryDate: "Date d'expiration",
      expiryDatePlaceholder: "Choisir une date",
      addProduct: "Ajouter le produit",
      trackedProducts: "Produits suivis",
      trackedProductsHelp: "Alertes 10 jours avant expiration",
      showCollected: "Afficher collectés",
      hideCollected: "Masquer collectés",
      tableHeaders: [
        "Rangée",
        "Nom du produit",
        "ID produit",
        "Expiration",
        "Date d'alerte",
        "Statut",
      ],
      typing: "Saisie:",
      keyboardGenericTitle: "Clavier virtuel",
      keyboardTitle: (name) => `Saisir ${name}`,
      openTextKeyboard: "Ouvrir le clavier virtuel pour le nom du produit",
      openNumberKeyboard: "Ouvrir le pavé numérique pour l'ID produit",
      keyboardCancel: "Fermer sans enregistrer",
      keyboardDone: "✓ Terminé",
      keyboardDoneLabel: "Terminé",
      keyboardLanguageLabel: "Changer la langue du clavier",
      keyboardShiftLabel: "Basculer en majuscules",
      keyboardBackspaceLabel: "Retour arrière",
      deleteKey: "SUPPR",
      space: "Espace",
      rowPickerTitle: "Choisir une rangée",
      rowPickerDone: "Terminé",
      rowPickerLabel: "Numéro de rangée",
      rowPickerSelected: "Rangée sélectionnée",
      calendarPrevious: "Mois précédent",
      calendarNext: "Mois suivant",
      calendarCancel: "Annuler",
      weekdays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
      toggle: (count) => `📋 Liste de collecte du jour (${count})`,
      heading: "Liste de collecte du jour",
      closePanel: "Fermer",
      empty: "Aucun produit à collecter.",
      collected: "✅ COLLECTÉ",
      collect: "🔴 COLLECTER MAINTENANT",
      soon: "🟡 EXPIRE BIENTÔT",
      expired: "⚫ EXPIRÉ",
      ok: "🟢 OK",
      markCollected: "✅ Marquer comme collecté",
      markedCollected: "✅ Collecté",
      remove: "🗑 Retirer",
      removeLabel: (name) => `Retirer ${name} du suivi des dates`,
      removeTitle: "Retirer le produit suivi ?",
      removePrompt: (name) =>
        `Retirer ${name} du suivi actif ? Une trace sera conservée.`,
      cancel: "Annuler",
      confirmRemove: "🗑 Retirer",
      fields: [
        "Rangée",
        "Nom du produit",
        "ID produit",
        "Date d'expiration",
        "Jours restants",
      ],
      days: (count) =>
        `${count} jour${count === 1 ? "" : "s"} restant${count === 1 ? "" : "s"}`,
      overdue: (count) => `En retard de ${count} jour${count === 1 ? "" : "s"}`,
      items: (count) => `${count} article${count === 1 ? "" : "s"}`,
      noEntries: "Aucune date d'expiration enregistrée.",
      noVisibleEntries: "Aucun produit collecté n'est affiché.",
      storageError: "Impossible d'enregistrer les dates dans ce navigateur.",
      serverSyncError:
        "Les dates sont enregistrées localement, mais le fichier JSON du serveur n'a pas pu être mis à jour.",
    },
    nl: {
      locale: "nl-BE",
      finderTab: "Productzoeker",
      finderSubtitle: "Product-ID zoeken",
      chooseApp: "App kiezen",
      trackerTab: "Vervaldatumtracker",
      trackerSubtitle: "Vervaldatums bijhouden",
      trackerTitle: "Vervaldatums bijhouden",
      eyebrow: "Voorraadrotatie",
      rowNumber: "Rijnummer",
      chooseRow: "Nummer invoeren",
      productName: "Productnaam",
      productNamePlaceholder: "bijv. Biologische melk",
      productId: "Product-ID",
      productIdPlaceholder: "bijv. 123456",
      expiryDate: "Vervaldatum",
      expiryDatePlaceholder: "Kies een datum",
      addProduct: "Product toevoegen",
      trackedProducts: "Gevolgde producten",
      trackedProductsHelp: "Meldingen 10 dagen voor vervaldatum",
      showCollected: "Toon verzamelde",
      hideCollected: "Verberg verzamelde",
      tableHeaders: [
        "Rij",
        "Productnaam",
        "Product-ID",
        "Vervaldatum",
        "Meldingsdatum",
        "Status",
      ],
      typing: "Typen:",
      keyboardGenericTitle: "Schermtoetsenbord",
      keyboardTitle: (name) => `${name} invoeren`,
      openTextKeyboard: "Aangepast toetsenbord voor productnaam openen",
      openNumberKeyboard: "Numeriek toetsenblok voor product-ID openen",
      keyboardCancel: "Sluiten zonder opslaan",
      keyboardDone: "✓ Gereed",
      keyboardDoneLabel: "Gereed",
      keyboardLanguageLabel: "Toetsenbordtaal wijzigen",
      keyboardShiftLabel: "Hoofdletters wisselen",
      keyboardBackspaceLabel: "Backspace",
      deleteKey: "WIS",
      space: "Spatie",
      rowPickerTitle: "Kies een voorraadrij",
      rowPickerDone: "Gereed",
      rowPickerLabel: "Voorraadrij",
      rowPickerSelected: "Geselecteerde rij",
      calendarPrevious: "Vorige maand",
      calendarNext: "Volgende maand",
      calendarCancel: "Annuleren",
      weekdays: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
      toggle: (count) => `📋 Lijst van vandaag (${count})`,
      heading: "Lijst van vandaag",
      closePanel: "Sluiten",
      empty: "Geen producten om te verzamelen.",
      collected: "✅ VERZAMELD",
      collect: "🔴 NU VERZAMELEN",
      soon: "🟡 VERLOOPT BINNENKORT",
      expired: "⚫ VERLOPEN",
      ok: "🟢 OK",
      markCollected: "✅ Markeren als verzameld",
      markedCollected: "✅ Verzameld",
      remove: "🗑 Verwijderen",
      removeLabel: (name) => `${name} uit de vervaldatumtracker verwijderen`,
      removeTitle: "Gevolgd product verwijderen?",
      removePrompt: (name) =>
        `${name} uit de actieve lijst verwijderen? De geschiedenis blijft bewaard.`,
      cancel: "Annuleren",
      confirmRemove: "🗑 Verwijderen",
      fields: [
        "Rij",
        "Productnaam",
        "Product-ID",
        "Vervaldatum",
        "Dagen resterend",
      ],
      days: (count) => `${count} dag${count === 1 ? "" : "en"} resterend`,
      overdue: (count) => `${count} dag${count === 1 ? "" : "en"} verlopen`,
      items: (count) => `${count} artikelen`,
      noEntries: "Geen vervaldatums geregistreerd.",
      noVisibleEntries:
        "Er worden momenteel geen verzamelde producten getoond.",
      storageError:
        "Vervaldatums konden niet in deze browser worden opgeslagen.",
      serverSyncError:
        "Vervaldatums zijn lokaal opgeslagen, maar het JSON-serverbestand kon niet worden bijgewerkt.",
    },
  };

  // Redesign wording: one word per idea (collecter / supprimer du suivi), no emoji in labels.
  Object.assign(labels.fr, {
    heading: "À collecter aujourd'hui",
    empty: "Rien à collecter aujourd'hui. Les produits apparaissent ici moins de 3 jours avant leur date d'expiration.",
    collected: "Collecté", collect: "À collecter", soon: "Expire bientôt", expired: "Expiré", ok: "OK",
    markCollected: "Marquer collecté", markedCollected: "Collecté",
    remove: "Supprimer", removeLabel: (name) => `Supprimer ${name} du suivi`,
    removeTitle: "Supprimer du suivi ?",
    removePrompt: (name) => `Supprimer « ${name} » du suivi ? L'historique est conservé.`,
    cancel: "Garder", confirmRemove: "Supprimer",
    showCollected: "Voir les collectés", hideCollected: "Masquer les collectés",
    trackedProducts: "Tous les produits suivis", addProduct: "Ajouter au suivi", trackerTitle: "Suivi des dates",
    rowNumber: "Rangée",
    tiles: ["À collecter", "Expire bientôt", "OK", "Collectés"],
    tileHints: ["moins de 3 jours", "10 jours ou moins", "plus de 10 jours", ""],
    period: "Période", from: "Du", to: "Au", clear: "Effacer",
    inPeriod: (n) => `${n} produit${n === 1 ? "" : "s"} dans la période`,
    collectAll: (n) => `Marquer ${n} collecté${n === 1 ? "" : "s"}`,
    collectedMany: (n) => `${n} produit${n === 1 ? "" : "s"} marqué${n === 1 ? "" : "s"} collecté${n === 1 ? "" : "s"}`,
    trackedProductsHelp: "Expire bientôt : 10 jours ou moins · À collecter : moins de 3 jours",
    rowShort: "Rangée", expiresOn: (d) => `expire le ${d}`, collectedToast: (n) => `${n} marqué collecté`, undo: "Annuler",
  });
  Object.assign(labels.en, {
    heading: "To collect today",
    empty: "Nothing to collect today. Products appear here less than 3 days before they expire.",
    collected: "Collected", collect: "Collect", soon: "Expiring soon", expired: "Expired", ok: "OK",
    markCollected: "Mark collected", markedCollected: "Collected", remove: "Delete", confirmRemove: "Delete", cancel: "Keep",
    removeTitle: "Delete from tracker?", showCollected: "Show collected", hideCollected: "Hide collected",
    trackedProducts: "All tracked products", addProduct: "Add to tracker", trackerTitle: "Expiry tracker", rowNumber: "Row",
    tiles: ["To collect", "Expiring soon", "OK", "Collected"],
    tileHints: ["under 3 days", "10 days or less", "over 10 days", ""],
    period: "Period", from: "From", to: "To", clear: "Clear",
    inPeriod: (n) => `${n} product${n === 1 ? "" : "s"} in this period`,
    collectAll: (n) => `Mark ${n} collected`,
    collectedMany: (n) => `${n} product${n === 1 ? "" : "s"} marked collected`,
    trackedProductsHelp: "Expiring soon: 10 days or less · To collect: under 3 days",
    rowShort: "Row", expiresOn: (d) => `expires ${d}`, collectedToast: (n) => `${n} marked collected`, undo: "Undo",
  });
  Object.assign(labels.nl, {
    heading: "Vandaag te verzamelen",
    empty: "Vandaag niets te verzamelen. Producten verschijnen hier minder dan 3 dagen voor de vervaldatum.",
    collected: "Verzameld", collect: "Verzamelen", soon: "Verloopt binnenkort", expired: "Verlopen", ok: "OK",
    markCollected: "Markeer verzameld", markedCollected: "Verzameld", remove: "Verwijderen", confirmRemove: "Verwijderen", cancel: "Behouden",
    showCollected: "Toon verzamelde", hideCollected: "Verberg verzamelde",
    trackedProducts: "Alle gevolgde producten", addProduct: "Toevoegen", trackerTitle: "Vervaldatums", rowNumber: "Rij",
    tiles: ["Te verzamelen", "Verloopt binnenkort", "OK", "Verzameld"],
    tileHints: ["minder dan 3 dagen", "10 dagen of minder", "meer dan 10 dagen", ""],
    period: "Periode", from: "Van", to: "Tot", clear: "Wissen",
    inPeriod: (n) => `${n} product${n === 1 ? "" : "en"} in deze periode`,
    collectAll: (n) => `${n} markeren als verzameld`,
    collectedMany: (n) => `${n} product${n === 1 ? "" : "en"} gemarkeerd als verzameld`,
    trackedProductsHelp: "Verloopt binnenkort: 10 dagen of minder · Te verzamelen: minder dan 3 dagen",
    rowShort: "Rij", expiresOn: (d) => `vervalt ${d}`, collectedToast: (n) => `${n} gemarkeerd als verzameld`, undo: "Ongedaan maken",
  });

  function formatShortDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(currentLocale(), { day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
  }

  // Status rules (set by the store owner, Nov 2026):
  //   À collecter   = not collected and expiring in less than 3 days (expired included)
  //   Expire bientôt = not collected and expiring in 10 days or less
  const COLLECT_DAYS = 3;
  const SOON_DAYS = 10;
  function entryStatus(entry, today) {
    if (entry.collected) return "collected";
    const days = daysBetween(today, entry.expiryDate);
    if (days < 0) return "expired";
    if (days < COLLECT_DAYS) return "collect";
    if (days <= SOON_DAYS) return "soon";
    return "ok";
  }
  const isToCollect = (entry, today) => !entry.collected && daysBetween(today, entry.expiryDate) < COLLECT_DAYS;

  const filterFrom = document.getElementById("filterFrom");
  const filterTo = document.getElementById("filterTo");
  const filterClear = document.getElementById("filterClear");
  const filterSummary = document.getElementById("filterSummary");
  const collectRange = document.getElementById("collectRange");
  const inRange = (entry) =>
    (!filterFrom.value || entry.expiryDate >= filterFrom.value) &&
    (!filterTo.value || entry.expiryDate <= filterTo.value);

  function renderSummary(today) {
    const box = document.getElementById("expirySummary");
    if (!box) return;
    const active = entries.filter((e) => !e.removed);
    const open = active.filter((e) => !e.collected);
    const due = open.filter((e) => daysBetween(today, e.expiryDate) < COLLECT_DAYS).length;
    const soon = open.filter((e) => daysBetween(today, e.expiryDate) <= SOON_DAYS).length;
    const ok = open.filter((e) => daysBetween(today, e.expiryDate) > SOON_DAYS).length;
    const done = active.length - open.length;
    const names = translate("tiles");
    const hints = translate("tileHints");
    box.replaceChildren();
    [[due, "collect"], [soon, "soon"], [ok, "ok"], [done, "collected"]].forEach(([n, kind], i) => {
      const tile = document.createElement("div");
      tile.className = `summary-tile ${kind}`;
      appendTextElement(tile, "strong", "", String(n));
      appendTextElement(tile, "span", "", names[i]);
      if (hints[i]) appendTextElement(tile, "small", "", hints[i]);
      box.append(tile);
    });
  }

  function currentLanguage() {
    return document.querySelector(".lang-btn.active")?.dataset.lang || "en";
  }

  function translate(key, ...args) {
    const value = labels[currentLanguage()]?.[key] ?? labels.en[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  }

  function currentLocale() {
    return translate("locale");
  }

  window.translateTracker = translate;

  function translateTrackerUi() {
    const setText = (selector, key) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = translate(key);
    };
    const setAttribute = (selector, attribute, key) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attribute, translate(key));
    };

    setText(
      "#shopSubtitle",
      document.getElementById("expiryPanel").hidden
        ? "finderSubtitle"
        : "trackerSubtitle",
    );
    document.documentElement.lang = currentLocale();
    setAttribute(".app-switcher", "aria-label", "chooseApp");
    setText("#finderTabLabel", "finderTab");
    setText("#expiryTabLabel", "trackerTab");
    setText("#expiryEyebrow", "eyebrow");
    setText("#expiryTitle", "trackerTitle");
    setText("#expiryRowLabel", "rowNumber");
    setText("#rowPickerHint", "chooseRow");
    setText("#expiryProductNameLabel", "productName");
    setText("#expiryProductIdLabel", "productId");
    setText("#expiryDateLabel", "expiryDate");
    setText("#expirySaveButton", "addProduct");
    setText("#trackedProductsHeading", "trackedProducts");
    setText("#trackedProductsHelp", "trackedProductsHelp");
    setText(
      "#collectedFilterToggle",
      showCollected ? "hideCollected" : "showCollected",
    );
    document
      .getElementById("collectedFilterToggle")
      .setAttribute("aria-pressed", String(showCollected));
    [
      "#expiryHeaderRow",
      "#expiryHeaderName",
      "#expiryHeaderId",
      "#expiryHeaderDate",
      "#expiryHeaderAlert",
      "#expiryHeaderStatus",
    ].forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = translate("tableHeaders")[index];
    });
    setText(
      "#expiryEmptyState",
      entries.some((entry) => entry.removed === false)
        ? "noVisibleEntries"
        : "noEntries",
    );
    document.getElementById("expiryProductName").placeholder = translate(
      "productNamePlaceholder",
    );
    document.getElementById("expiryProductId").placeholder = translate(
      "productIdPlaceholder",
    );
    document.getElementById("expiryDate").placeholder = translate(
      "expiryDatePlaceholder",
    );
    setAttribute("#expiryDate", "aria-label", "expiryDate");
    setAttribute("#rowPickerTrigger", "title", "chooseRow");
    setAttribute(
      '[data-keyboard-target="expiryProductName"]',
      "aria-label",
      "openTextKeyboard",
    );
    setAttribute(
      '[data-keyboard-target="expiryProductName"]',
      "title",
      "openTextKeyboard",
    );
    setAttribute(
      '[data-keyboard-target="expiryProductId"]',
      "aria-label",
      "openNumberKeyboard",
    );
    setAttribute(
      '[data-keyboard-target="expiryProductId"]',
      "title",
      "openNumberKeyboard",
    );
    setText("#keyboardTypingLabel", "typing");
    const keyboardTitleElement = document.getElementById("keyboardTitle");
    const keyboardFieldKey =
      keyboardTitleElement.dataset.fieldId === "expiryProductName"
        ? "productName"
        : "productId";
    keyboardTitleElement.textContent =
      !document.getElementById("touchKeyboard").hidden &&
      keyboardTitleElement.dataset.fieldId
        ? translate("keyboardTitle", translate(keyboardFieldKey))
        : translate("keyboardGenericTitle");
    setAttribute("#touchKeyboardCancel", "aria-label", "keyboardCancel");
    setText("#touchKeyboardDone", "keyboardDone");
    setAttribute("#touchKeyboardDone", "aria-label", "keyboardDoneLabel");
    setAttribute("#keyboardLanguage", "aria-label", "keyboardLanguageLabel");
    setText("#rowPickerTitle", "rowPickerTitle");
    setAttribute("#rowPickerClose", "aria-label", "rowPickerDone");
    setAttribute("#rowWheel", "aria-label", "rowPickerLabel");
    setAttribute("#rowPickerTrigger", "aria-label", "chooseRow");
    setText("#rowPickerSelectedLabel", "rowPickerSelected");
    setAttribute('[data-calendar-move="-1"]', "aria-label", "calendarPrevious");
    setAttribute('[data-calendar-move="1"]', "aria-label", "calendarNext");
    setText("#calendarCancelButton", "calendarCancel");
    translate("weekdays").forEach((weekday, index) => {
      const dayIndex = String((index + 1) % 7);
      const weekdayElement = document.querySelector(
        `[data-weekday="${dayIndex}"]`,
      );
      if (weekdayElement) weekdayElement.textContent = weekday;
    });
    setText("#collectionEmptyState", "empty");
    document.getElementById("expiryEntryCount").textContent = translate(
      "items",
      entries.filter((entry) => entry.removed === false).length,
    );
    setText("#removeConfirmTitle", "removeTitle");
    setText("#cancelRemove", "cancel");
    setText("#confirmRemove", "confirmRemove");
    const pendingEntry = entries.find((entry) => entry.id === pendingRemoveId);
    if (pendingEntry)
      removeConfirmMessage.textContent = translate(
        "removePrompt",
        pendingEntry.productName,
      );
    if (!storageError.hidden)
      storageError.textContent = translate(
        storageError.dataset.messageKey || "storageError",
      );
  }

  function todayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function shiftDate(dateString, days) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
  }

  function daysBetween(fromDate, toDate) {
    const [fromYear, fromMonth, fromDay] = fromDate.split("-").map(Number);
    const [toYear, toMonth, toDay] = toDate.split("-").map(Number);
    const from = Date.UTC(fromYear, fromMonth - 1, fromDay);
    const to = Date.UTC(toYear, toMonth - 1, toDay);
    return Math.round((to - from) / 86400000);
  }

  function normalizeEntries(saved) {
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(
        (entry) =>
          entry &&
          typeof entry.id === "string" &&
          typeof entry.rowNumber === "string" &&
          typeof entry.productName === "string" &&
          typeof entry.productId === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(entry.expiryDate) &&
          /^\d{4}-\d{2}-\d{2}$/.test(entry.alertDate),
      )
      .map((entry) => ({
        ...entry,
        collected: entry.collected === true,
        removed: entry.removed === true,
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
      }));
  }

  function loadEntries() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const normalized = normalizeEntries(saved);
      if (
        normalized.some(
          (entry, index) =>
            typeof saved[index]?.collected !== "boolean" ||
            typeof saved[index]?.removed !== "boolean",
        )
      ) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } catch (error) {
          // Keep valid in-memory entries if the browser cache is unavailable.
        }
      }
      return normalized;
    } catch (error) {
      return [];
    }
  }

  let entries = loadEntries();
  let serverSyncQueue = Promise.resolve();
  let serverSyncFailed = false;

  function mergeEntrySets(serverEntries, localEntries) {
    const merged = new Map(serverEntries.map((entry) => [entry.id, entry]));
    localEntries.forEach((localEntry) => {
      const serverEntry = merged.get(localEntry.id);
      const localTimestamp = Date.parse(localEntry.updatedAt) || 0;
      const serverTimestamp = Date.parse(serverEntry?.updatedAt) || 0;
      if (!serverEntry || localTimestamp > serverTimestamp) {
        merged.set(localEntry.id, localEntry);
      }
    });
    return [...merged.values()];
  }

  function syncEntriesToServer(snapshot) {
    const body = JSON.stringify({ entries: snapshot });
    serverSyncQueue = serverSyncQueue
      .catch(() => {})
      .then(async () => {
        const response = await fetch("expiry_storage.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body,
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error("Server JSON write failed");
        }
        serverSyncFailed = false;
        storageError.hidden = true;
      })
      .catch(() => {
        serverSyncFailed = true;
        showStorageError("serverSyncError");
      });
    return serverSyncQueue;
  }

  async function loadServerEntries() {
    try {
      const response = await fetch("expiry_storage.php", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success || !Array.isArray(result.entries)) {
        throw new Error("Server JSON read failed");
      }

      if (!result.exists) {
        if (entries.length > 0) syncEntriesToServer(entries);
        return;
      }

      const serverEntries = normalizeEntries(result.entries);
      const mergedEntries = mergeEntrySets(serverEntries, entries);
      const localIsNewer =
        JSON.stringify(mergedEntries) !== JSON.stringify(serverEntries);
      entries = mergedEntries;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        showStorageError("storageError");
      }
      renderEntries();
      if (localIsNewer) syncEntriesToServer(entries);
    } catch (error) {
      serverSyncFailed = true;
      showStorageError("serverSyncError");
      renderEntries();
    }
  }

  function saveEntries() {
    try {
      const updatedAt = new Date().toISOString();
      const updatedEntries = entries.map((entry) => ({ ...entry, updatedAt }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      entries = updatedEntries;
      storageError.hidden = true;
      syncEntriesToServer(updatedEntries);
      return true;
    } catch (error) {
      showStorageError("storageError");
      return false;
    }
  }

  function appendTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function showStorageError(messageKey = "storageError") {
    storageError.hidden = false;
    storageError.dataset.messageKey = messageKey;
    storageError.textContent = translate(messageKey);
  }

  function dueEntriesFor(today) {
    return entries
      .filter(
        (entry) =>
          entry.removed === false && isToCollect(entry, today),
      )
      .sort((first, second) =>
        first.expiryDate.localeCompare(second.expiryDate),
      );
  }

  function renderCollectionList(today) {
    const activeDue = dueEntriesFor(today);
    const visibleDue = [...activeDue];
    recentlyCollected.forEach((id) => {
      const entry = entries.find((candidate) => candidate.id === id);
      if (
        entry &&
        entry.collected === true &&
        entry.removed === false &&
        daysBetween(today, entry.expiryDate) < COLLECT_DAYS
      ) {
        visibleDue.push(entry);
      }
    });

    collectionToggle.textContent = translate("toggle", activeDue.length);
    collectionToggle.disabled = activeDue.length === 0;
    collectionHeading.textContent = translate("heading");
    document.getElementById("closeCollectionPanel").textContent =
      translate("closePanel");
    document
      .getElementById("closeCollectionPanel")
      .setAttribute("aria-label", translate("closePanel"));
    collectionEmptyState.textContent = translate("empty");
    collectionEmptyState.hidden = visibleDue.length > 0;
    collectionPanel.hidden = false;
    collectionHeading.dataset.count = String(activeDue.length);

    collectionEntries.replaceChildren();
    const headers = translate("fields");
    visibleDue.forEach((entry) => {
      const isDone = entry.collected === true;
      const days = daysBetween(today, entry.expiryDate);
      const item = document.createElement("article");
      item.className = `collection-item${isDone ? " collected-done" : ""}`;
      item.dataset.entryId = entry.id;

      const shelf = document.createElement("div");
      shelf.className = "collection-shelf";
      appendTextElement(shelf, "span", "", translate("rowShort"));
      appendTextElement(shelf, "strong", "", entry.rowNumber);
      item.append(shelf);

      const details = document.createElement("div");
      details.className = "collection-item-details";
      appendTextElement(details, "strong", "collection-name", entry.productName);
      appendTextElement(
        details,
        "span",
        "collection-meta",
        `ID ${entry.productId} · ${translate("expiresOn", formatShortDate(entry.expiryDate))} · ${
          days < 0 ? translate("overdue", Math.abs(days)) : translate("days", days)
        }`,
      );
      item.append(details);
      const status = days < 0 ? "expired" : "collect";
      appendTextElement(item, "span", `expiry-status ${status}`, translate(status));

      if (isDone) {
        appendTextElement(
          item,
          "span",
          "collection-done-badge",
          translate("markedCollected"),
        );
      } else {
        const collectButton = appendTextElement(
          item,
          "button",
          "mark-collected-btn",
          translate("markCollected"),
        );
        collectButton.type = "button";
        collectButton.dataset.collectId = entry.id;
      }
      collectionEntries.append(item);
    });
  }

  function renderEntries() {
    const today = todayKey();
    const visibleEntries = entries.filter((entry) => entry.removed === false);
    const displayedEntries = visibleEntries.filter(
      (entry) => (showCollected || entry.collected === false) && inRange(entry),
    );
    renderFilter(visibleEntries);
    translateTrackerUi();
    entriesBody.replaceChildren();
    entryCount.textContent = translate("items", visibleEntries.length);
    emptyState.textContent =
      visibleEntries.length > 0
        ? translate("noVisibleEntries")
        : translate("noEntries");
    emptyState.hidden = displayedEntries.length > 0;
    collectedFilterToggle.hidden = !visibleEntries.some(
      (entry) => entry.collected === true,
    );

    let previousMonth = "";
    displayedEntries
      .slice()
      .sort((first, second) =>
        first.expiryDate.localeCompare(second.expiryDate),
      )
      .forEach((entry) => {
        const monthKey = entry.expiryDate.slice(0, 7);
        if (monthKey !== previousMonth) {
          const [year, month] = monthKey.split("-").map(Number);
          const monthHeading = new Intl.DateTimeFormat(currentLocale(), {
            month: "long",
            year: "numeric",
          }).format(new Date(year, month - 1, 1));
          const groupRow = document.createElement("tr");
          groupRow.className = "expiry-month-group";
          const groupCell = document.createElement("th");
          groupCell.colSpan = 6;
          groupCell.scope = "rowgroup";
          groupCell.textContent = monthHeading;
          groupRow.append(groupCell);
          entriesBody.append(groupRow);
          previousMonth = monthKey;
        }
        const statusClass = entryStatus(entry, today);
        const row = document.createElement("tr");
        [
          entry.rowNumber,
          entry.productName,
          entry.productId,
          entry.expiryDate,
          entry.alertDate,
        ].forEach((value) => {
          appendTextElement(row, "td", "", value);
        });

        const statusCell = document.createElement("td");
        const statusText = translate(statusClass);
        appendTextElement(
          statusCell,
          "span",
          `expiry-status ${statusClass}`,
          statusText,
        );

        if (!entry.collected) {
          const rowCollect = appendTextElement(statusCell, "button", "expiry-collect-btn", translate("markCollected"));
          rowCollect.type = "button";
          rowCollect.dataset.collectId = entry.id;
          rowCollect.setAttribute("aria-label", `${translate("markCollected")} : ${entry.productName}`);
        }
        const removeButton = appendTextElement(
          statusCell,
          "button",
          "expiry-remove-btn",
          translate("remove"),
        );
        removeButton.type = "button";
        removeButton.dataset.removeId = entry.id;
        removeButton.setAttribute(
          "aria-label",
          translate("removeLabel", entry.productName),
        );
        row.append(statusCell);
        entriesBody.append(row);
      });

    renderCollectionList(today);
    renderSummary(today);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const rowNumber = String(formData.get("rowNumber")).trim();
    const productName = String(formData.get("productName")).trim();
    const productId = String(formData.get("productId")).trim();
    const expiryDate = String(formData.get("expiryDate"));
    if (
      !/^\d+$/.test(rowNumber) ||
      Number(rowNumber) < 1 ||
      !productName ||
      !productId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
    )
      return;

    const id =
      window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    entries.push({
      id,
      rowNumber,
      productName,
      productId,
      expiryDate,
      alertDate: shiftDate(expiryDate, -ALERT_LEAD_DAYS),
      collected: false,
      removed: false,
    });

    if (saveEntries()) {
      form.reset();
      renderEntries();
      document.getElementById("expiryRow").focus();
    } else {
      entries = entries.filter((entry) => entry.id !== id);
    }
  });

  entriesBody.addEventListener("click", (event) => {
    const removeButton = event.target.closest("button[data-remove-id]");
    if (!removeButton) return;
    const entry = entries.find(
      (candidate) => candidate.id === removeButton.dataset.removeId,
    );
    if (!entry) return;
    pendingRemoveId = entry.id;
    document.getElementById("removeConfirmTitle").textContent =
      translate("removeTitle");
    removeConfirmMessage.textContent = translate(
      "removePrompt",
      entry.productName,
    );
    document.getElementById("cancelRemove").textContent = translate("cancel");
    document.getElementById("confirmRemove").textContent =
      translate("confirmRemove");
    removeConfirmOverlay.hidden = false;
    document.getElementById("confirmRemove").focus();
  });

  function closeRemoveConfirm() {
    removeConfirmOverlay.hidden = true;
    pendingRemoveId = null;
  }

  document
    .getElementById("cancelRemove")
    .addEventListener("click", closeRemoveConfirm);
  removeConfirmOverlay.addEventListener("click", (event) => {
    if (event.target === removeConfirmOverlay) closeRemoveConfirm();
  });
  document.getElementById("confirmRemove").addEventListener("click", () => {
    const entry = entries.find((candidate) => candidate.id === pendingRemoveId);
    if (!entry) {
      closeRemoveConfirm();
      return;
    }
    entry.removed = true;
    if (saveEntries()) {
      closeRemoveConfirm();
      renderEntries();
    } else {
      entry.removed = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !removeConfirmOverlay.hidden)
      closeRemoveConfirm();
  });

  function renderFilter(visibleEntries) {
    const active = Boolean(filterFrom.value || filterTo.value);
    filterClear.hidden = !active;
    document.getElementById("dateFilterLabel").textContent = translate("period");
    filterFrom.placeholder = translate("from"); filterFrom.setAttribute("aria-label", translate("from"));
    filterTo.placeholder = translate("to"); filterTo.setAttribute("aria-label", translate("to"));
    filterClear.textContent = translate("clear");
    const fmt = (key) => (key ? formatShortDate(key) : "");
    filterFrom.dataset.display = fmt(filterFrom.value);
    filterTo.dataset.display = fmt(filterTo.value);
    const matching = visibleEntries.filter((e) => inRange(e) && (showCollected || !e.collected));
    const toCollect = matching.filter((e) => !e.collected);
    filterSummary.textContent = active ? translate("inPeriod", matching.length) : "";
    collectRange.hidden = !active || toCollect.length === 0;
    collectRange.textContent = translate("collectAll", toCollect.length);
  }
  [filterFrom, filterTo].forEach((input) => input.addEventListener("change", () => renderEntries()));
  filterClear.addEventListener("click", () => { filterFrom.value = ""; filterTo.value = ""; renderEntries(); });
  collectRange.addEventListener("click", () => {
    const ids = entries.filter((e) => !e.removed && !e.collected && inRange(e)).map((e) => e.id);
    if (!ids.length) return;
    ids.forEach((id) => { const e = entries.find((c) => c.id === id); if (e) e.collected = true; });
    if (!saveEntries()) return;
    renderEntries();
    window.bpToast(translate("collectedMany", ids.length), {
      label: translate("undo"),
      onClick: () => {
        ids.forEach((id) => { const e = entries.find((c) => c.id === id); if (e) e.collected = false; });
        saveEntries();
        renderEntries();
      },
    });
  });

  entriesBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-collect-id]");
    if (button) collectEntry(button.dataset.collectId);
  });

  collectionEntries.addEventListener("click", (event) => {
    const collectButton = event.target.closest("button[data-collect-id]");
    if (collectButton) collectEntry(collectButton.dataset.collectId);
  });

  function collectEntry(id) {
    const entry = entries.find((candidate) => candidate.id === id);
    if (!entry || entry.collected || entry.removed) return;

    entry.collected = true;
    if (!saveEntries()) {
      entry.collected = false;
      return;
    }

    recentlyCollected.add(entry.id);
    renderEntries();
    window.bpToast(translate("collectedToast", entry.productName), {
      label: translate("undo"),
      onClick: () => {
        // saveEntries() replaces entries with copies, so look the entry up again by id.
        const current = entries.find((candidate) => candidate.id === entry.id);
        if (!current) return;
        current.collected = false;
        recentlyCollected.delete(entry.id);
        saveEntries();
        renderEntries();
      },
    });
    window.setTimeout(() => {
      recentlyCollected.delete(entry.id);
      renderEntries();
    }, 700);
  }

  collectionToggle.addEventListener("click", () => {
    if (collectionToggle.disabled) return;
    collectionPanel.hidden = !collectionPanel.hidden;
    collectionToggle.setAttribute(
      "aria-expanded",
      String(!collectionPanel.hidden),
    );
  });

  document
    .getElementById("closeCollectionPanel")
    .addEventListener("click", () => {
      collectionPanel.hidden = true;
      collectionToggle.setAttribute("aria-expanded", "false");
      collectionToggle.focus();
    });

  collectedFilterToggle.addEventListener("click", () => {
    showCollected = !showCollected;
    renderEntries();
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(renderEntries, 0));
  });

  renderEntries();
  loadServerEntries();
  window.setInterval(() => {
    renderEntries();
    if (serverSyncFailed) syncEntriesToServer(entries);
  }, 60000);
})();

(() => {
  const finderTab = document.getElementById("finderTab");
  const expiryTab = document.getElementById("expiryTab");
  const finderPanel = document.getElementById("finderPanel");
  const expiryPanel = document.getElementById("expiryPanel");
  const shopSubtitle = document.getElementById("shopSubtitle");
  if (!finderTab || !expiryTab || !finderPanel || !expiryPanel) return;
  const translate = window.translateTracker;

  const tabs = [finderTab, expiryTab];
  const panels = [finderPanel, expiryPanel];
  const keyboardOverlay = document.getElementById("touchKeyboard");
  const keyboardKeys = document.getElementById("touchKeys");
  const keyboardTitle = document.getElementById("keyboardTitle");
  const keyboardPreviewValue = document.getElementById("keyboardPreviewValue");
  const keyboardLanguageButton = document.getElementById("keyboardLanguage");
  const keyboardDoneButton = document.getElementById("touchKeyboardDone");
  const keyboardCancelButton = document.getElementById("touchKeyboardCancel");
  const calendarOverlay = document.getElementById("expiryCalendar");
  const calendarTitle = document.getElementById("calendarTitle");
  const calendarDays = document.getElementById("calendarDays");
  const expiryDateInput = document.getElementById("expiryDate");
  const rowInput = document.getElementById("expiryRow");
  const rowDisplay = document.getElementById("rowNumberDisplay");
  const rowPickerTrigger = document.getElementById("rowPickerTrigger");
  const rowPickerOverlay = document.getElementById("rowPickerOverlay");
  const rowPickerClose = document.getElementById("rowPickerClose");
  const rowWheel = document.getElementById("rowWheel");
  const rowPickerSelection = document.getElementById("rowPickerSelection");
  let keyboardTarget = null;
  let keyboardTrigger = null;
  let keyboardType = "text";
  let keyboardLanguage = "en";
  let keyboardOriginalValue = "";
  let keyboardOriginalInputMode = "text";
  let calendarMonth = new Date();
  let calendarTarget = null; // the input the calendar is filling
  let isShifted = false;
  let keyboardStart = 0;
  let keyboardEnd = 0;
  let rowScrollFrame = false;

  function closeKeyboard(cancelChanges = false) {
    if (keyboardTarget) {
      if (cancelChanges) {
        keyboardTarget.value = keyboardOriginalValue;
        keyboardTarget.dispatchEvent(new Event("input", { bubbles: true }));
      }
      keyboardTarget.inputMode = keyboardOriginalInputMode;
      keyboardTarget = null;
    }
    keyboardOverlay.hidden = true;
    const trigger = keyboardTrigger;
    keyboardTrigger = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }

  function closeTouchOverlays() {
    closeKeyboard(false);
    calendarOverlay.hidden = true;
    rowPickerOverlay.hidden = true;
  }

  function selectApp(index, focusTab = false) {
    closeTouchOverlays();
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panels[tabIndex].hidden = !isActive;
      panels[tabIndex].classList.toggle("active", isActive);
    });
    shopSubtitle.textContent = translate(
      index === 0 ? "finderSubtitle" : "trackerSubtitle",
    );
    if (focusTab) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectApp(index));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown")
        nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        nextIndex = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex !== null) {
        event.preventDefault();
        selectApp(nextIndex, true);
      }
    });
  });

  function renderKeyboard() {
    keyboardKeys.replaceChildren();
    const layouts = {
      en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
      fr: ["azertyuiop", "qsdfghjklm", "wxcvbn"],
      nl: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
    };
    const rows =
      keyboardType === "numeric"
        ? [
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["DEL", "0", "✓"],
          ]
        : [
            [..."1234567890"],
            [...layouts[keyboardLanguage][0]],
            [...layouts[keyboardLanguage][1]],
            ["shift", ...layouts[keyboardLanguage][2], "⌫"],
            ["-", "_", "@", "é", "à", "è", "ç", "ù", "space"],
          ];

    keyboardLanguageButton.hidden = keyboardType === "numeric";
    keyboardLanguageButton.textContent = keyboardLanguage.toUpperCase();

    rows.forEach((row) => {
      const keyRow = document.createElement("div");
      keyRow.className = "touch-key-row";
      if (keyboardType === "numeric") keyRow.classList.add("numeric-key-row");
      row.forEach((key) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "touch-key";
        button.dataset.keyValue = key;
        if (key === "space") {
          button.textContent = translate("space");
          button.classList.add("space-key");
        } else if (key === "✓") {
          button.textContent = "✓";
          button.setAttribute("aria-label", translate("keyboardDoneLabel"));
          button.classList.add("utility-key", "keyboard-submit-key");
        } else if (key === "shift") {
          button.textContent = "⇧";
          button.setAttribute("aria-label", translate("keyboardShiftLabel"));
          button.classList.add("utility-key");
        } else if (key === "⌫" || key === "DEL") {
          button.textContent = key === "DEL" ? translate("deleteKey") : "⌫";
          button.setAttribute(
            "aria-label",
            translate("keyboardBackspaceLabel"),
          );
          button.classList.add("utility-key");
        } else {
          button.textContent = isShifted ? key.toUpperCase() : key;
        }
        keyRow.append(button);
      });
      keyboardKeys.append(keyRow);
    });
  }

  function updateKeyboardPreview() {
    if (!keyboardTarget) return;
    keyboardPreviewValue.textContent = `"${keyboardTarget.value}"`;
    keyboardStart =
      keyboardTarget.selectionStart ?? keyboardTarget.value.length;
    keyboardEnd = keyboardTarget.selectionEnd ?? keyboardStart;
  }

  function openKeyboard(input, trigger) {
    keyboardTarget = input;
    keyboardTrigger = trigger;
    keyboardType = input.dataset.keyboard;
    keyboardStart = input.value.length;
    keyboardEnd = keyboardStart;
    input.setSelectionRange(keyboardStart, keyboardEnd);
    keyboardOriginalValue = input.value;
    keyboardOriginalInputMode = input.inputMode || "text";
    keyboardLanguage =
      document.querySelector(".lang-btn.active")?.dataset.lang || "en";
    keyboardTitle.dataset.fieldId = input.id;
    input.inputMode = "none";
    const fieldKey =
      input.id === "expiryProductName" ? "productName" : input.id === "expiryRowEntry" ? "rowNumber" : "productId";
    keyboardTitle.textContent = translate("keyboardTitle", translate(fieldKey));
    isShifted = false;
    updateKeyboardPreview();
    renderKeyboard();
    calendarOverlay.hidden = true;
    rowPickerOverlay.hidden = true;
    keyboardOverlay.hidden = false;
  }

  function insertKeyboardValue(value) {
    if (!keyboardTarget) return;
    const input = keyboardTarget;
    if (value === "✓") {
      closeKeyboard(false);
      return;
    }
    if (value === "shift") {
      isShifted = !isShifted;
      renderKeyboard();
      return;
    }

    const start = keyboardStart;
    const end = keyboardEnd;
    const maxLength = input.maxLength > 0 ? input.maxLength : Infinity;
    let nextValue = input.value;
    let nextPosition = start;
    let refreshKeyboard = false;

    if (value === "⌫" || value === "DEL") {
      const deleteStart = start === end ? Math.max(0, start - 1) : start;
      nextValue = `${input.value.slice(0, deleteStart)}${input.value.slice(end)}`;
      nextPosition = deleteStart;
    } else {
      const character =
        value === "space" ? " " : isShifted ? value.toUpperCase() : value;
      refreshKeyboard = isShifted;
      const available = maxLength - (input.value.length - (end - start));
      const insertion = character.slice(0, Math.max(0, available));
      nextValue = `${input.value.slice(0, start)}${insertion}${input.value.slice(end)}`;
      nextPosition = start + insertion.length;
      if (isShifted) isShifted = false;
    }

    input.value = nextValue;
    keyboardStart = nextPosition;
    keyboardEnd = nextPosition;
    input.setSelectionRange(keyboardStart, keyboardEnd);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    updateKeyboardPreview();
    if (refreshKeyboard) renderKeyboard();
  }

  keyboardKeys.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key-value]");
    if (button) insertKeyboardValue(button.dataset.keyValue);
  });

  keyboardDoneButton.addEventListener("click", () => closeKeyboard(false));
  keyboardCancelButton.addEventListener("click", () => closeKeyboard(true));
  keyboardLanguageButton.addEventListener("click", () => {
    const order = ["en", "fr", "nl"];
    keyboardLanguage =
      order[(order.indexOf(keyboardLanguage) + 1) % order.length];
    document
      .querySelector(`.lang-btn[data-lang="${keyboardLanguage}"]`)
      ?.click();
    renderKeyboard();
  });

  keyboardOverlay.addEventListener("click", (event) => {
    if (event.target === keyboardOverlay) closeKeyboard(false);
  });

  document
    .querySelectorAll("#expiryForm input[data-keyboard]")
    .forEach((input) => {
      input.addEventListener("input", updateKeyboardPreview);
    });

  document.querySelectorAll(".touch-keyboard-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const input = document.getElementById(trigger.dataset.keyboardTarget);
      if (input) openKeyboard(input, trigger);
    });
  });

  const rowFragment = document.createDocumentFragment();
  for (let rowNumber = 1; rowNumber <= 170; rowNumber += 1) {
    const option = document.createElement("div");
    option.className = "row-wheel-option";
    option.dataset.row = String(rowNumber);
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.textContent = String(rowNumber);
    rowFragment.append(option);
  }
  rowWheel.append(rowFragment);

  function updateRowSelection() {
    const rowNumber = Math.min(
      170,
      Math.max(1, Math.round(rowWheel.scrollTop / 40) + 1),
    );
    rowInput.value = String(rowNumber);
    rowDisplay.textContent = String(rowNumber);
    rowPickerSelection.textContent = String(rowNumber);
    rowWheel.querySelectorAll(".row-wheel-option").forEach((option) => {
      const selected = Number(option.dataset.row) === rowNumber;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-selected", String(selected));
    });
  }

  document.getElementById("expiryForm").addEventListener("reset", () => {
    window.setTimeout(() => {
      rowWheel.scrollTop = (Number(rowInput.value || 1) - 1) * 40;
      updateRowSelection();
    }, 0);
  });

  rowWheel.addEventListener("scroll", () => {
    if (rowScrollFrame) return;
    rowScrollFrame = true;
    window.requestAnimationFrame(() => {
      updateRowSelection();
      rowScrollFrame = false;
    });
  });

  rowWheel.addEventListener("click", (event) => {
    const option = event.target.closest(".row-wheel-option");
    if (!option) return;
    rowWheel.scrollTo({
      top: (Number(option.dataset.row) - 1) * 40,
      behavior: "smooth",
    });
  });

  function closeRowPicker() {
    rowPickerOverlay.hidden = true;
    rowPickerTrigger.focus({ preventScroll: true });
  }

  // Shelf row is typed on the number pad, like the product ID (owner request).
  const rowEntry = document.getElementById("expiryRowEntry");
  const ROW_MAX = 170;
  function syncRowFromEntry() {
    const n = parseInt(rowEntry.value, 10);
    if (Number.isFinite(n) && n >= 1) {
      const row = String(Math.min(n, ROW_MAX));
      rowInput.value = row;
      rowDisplay.textContent = row;
    }
  }
  rowEntry.addEventListener("input", syncRowFromEntry);
  rowPickerTrigger.addEventListener("click", () => {
    rowEntry.value = "";
    openKeyboard(rowEntry, rowPickerTrigger);
  });
  document.getElementById("expiryForm").addEventListener("reset", () => {
    setTimeout(() => { rowEntry.value = ""; rowDisplay.textContent = rowInput.value || "1"; }, 0);
  });
  rowPickerClose.addEventListener("click", closeRowPicker);
  rowPickerOverlay.addEventListener("click", (event) => {
    if (event.target === rowPickerOverlay) closeRowPicker();
  });

  function localDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    calendarTitle.textContent = calendarMonth.toLocaleDateString(
      translate("locale"),
      { month: "long", year: "numeric" },
    );
    calendarDays.replaceChildren();

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = localDateKey(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    for (let index = 0; index < totalCells; index += 1) {
      const day = index - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) {
        const emptyCell = document.createElement("span");
        emptyCell.className = "calendar-empty";
        calendarDays.append(emptyCell);
        continue;
      }

      const dateKey = localDateKey(year, month, day);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.dataset.date = dateKey;
      button.textContent = String(day);
      button.setAttribute(
        "aria-label",
        new Date(year, month, day).toLocaleDateString(translate("locale"), {
          dateStyle: "full",
        }),
      );
      if (dateKey === todayKey) button.classList.add("today");
      if (calendarTarget && calendarTarget.value === dateKey) button.classList.add("selected");
      calendarDays.append(button);
    }
  }

  function openCalendar(input) {
    calendarTarget = input;
    const selectedParts = input.value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );
    calendarMonth = selectedParts
      ? new Date(Number(selectedParts[1]), Number(selectedParts[2]) - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    renderCalendar();
    keyboardOverlay.hidden = true;
    calendarOverlay.hidden = false;
  }
  expiryDateInput.addEventListener("click", () => openCalendar(expiryDateInput));
  ["filterFrom", "filterTo"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("click", () => openCalendar(input));
  });

  calendarOverlay.addEventListener("click", (event) => {
    if (
      event.target === calendarOverlay ||
      event.target.closest("[data-calendar-action='close']")
    ) {
      calendarOverlay.hidden = true;
      (calendarTarget || expiryDateInput).focus({ preventScroll: true });
      return;
    }

    const monthButton = event.target.closest("[data-calendar-move]");
    if (monthButton) {
      calendarMonth.setMonth(
        calendarMonth.getMonth() + Number(monthButton.dataset.calendarMove),
      );
      renderCalendar();
      return;
    }

    const dayButton = event.target.closest("button[data-date]");
    if (dayButton) {
      const target = calendarTarget || expiryDateInput;
      target.value = dayButton.dataset.date;
      target.dispatchEvent(new Event("change", { bubbles: true }));
      calendarOverlay.hidden = true;
      target.focus({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTouchOverlays();
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      window.setTimeout(() => {
        if (
          keyboardTarget &&
          !keyboardOverlay.hidden &&
          keyboardType === "text"
        ) {
          keyboardLanguage = button.dataset.lang;
          const fieldKey =
            keyboardTarget.id === "expiryProductName"
              ? "productName"
              : keyboardTarget.id === "expiryRowEntry"
                ? "rowNumber"
                : "productId";
          keyboardTitle.textContent = translate(
            "keyboardTitle",
            translate(fieldKey),
          );
          renderKeyboard();
        }
        if (!calendarOverlay.hidden) renderCalendar();
      }, 0);
    });
  });
})();
