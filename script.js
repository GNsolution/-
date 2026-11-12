// GN Solutions interactions
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme, savePreference = true) {
  const isLight = theme === "light";
  document.documentElement.dataset.theme = isLight ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
  themeToggle.innerHTML = `<i data-lucide="${isLight ? "moon" : "sun"}"></i><span>${isLight ? "Dark" : "Light"} mode</span>`;
  themeColor.setAttribute("content", isLight ? "#f4f7fc" : "#080b16");

  if (savePreference) {
    try {
      localStorage.setItem("gn-solutions-theme", isLight ? "light" : "dark");
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }
  }

  if (window.lucide) lucide.createIcons();
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("gn-solutions-theme");
} catch (error) {
  console.error("Unable to read the saved theme preference.", error);
}
setTheme(savedTheme === "light" ? "light" : "dark", false);

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

const languageSelect = document.getElementById("languageSelect");
const languageLocales = {
  en: "en",
  zh: "zh-CN",
  ur: "ur-PK",
  ja: "ja-JP",
  ko: "ko-KR",
  id: "id-ID",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES"
};
const languageStorageKey = "gn-solutions-language";
const languageStatus = document.getElementById("languageStatus");
const googleLanguageCodes = {
  en: "en",
  zh: "zh-CN",
  ur: "ur",
  ja: "ja",
  ko: "ko",
  id: "id",
  fr: "fr",
  de: "de",
  es: "es"
};
let translationWidgetReady = false;

try {
  const savedLanguage = localStorage.getItem(languageStorageKey);
  if (savedLanguage && languageLocales[savedLanguage]) {
    languageSelect.value = savedLanguage;
  }
} catch (error) {
  console.error("Unable to read the saved language preference.", error);
}
document.documentElement.lang = languageLocales[languageSelect.value];

function applySelectedLanguage() {
  const language = languageSelect.value;
  document.documentElement.lang = languageLocales[languageSelect.value];
  try {
    localStorage.setItem(languageStorageKey, languageSelect.value);
  } catch (error) {
    console.error("Unable to save the language preference.", error);
  }

  const translateSelect = document.querySelector(".goog-te-combo");
  if (!translationWidgetReady || !translateSelect) {
    languageStatus.hidden = false;
    languageStatus.textContent = language === "en"
      ? "English selected."
      : "Loading the translation service…";
    return;
  }

  if (language === "en" && translateSelect.value !== "") {
    languageStatus.hidden = false;
    languageStatus.textContent = "Restoring the original English page…";
    window.location.reload();
    return;
  }

  const targetLanguage = language === "en" ? "" : googleLanguageCodes[language];
  translateSelect.value = targetLanguage;
  if (translateSelect.value !== targetLanguage) {
    languageStatus.hidden = false;
    languageStatus.textContent = "This language is not available from the translation service right now.";
    return;
  }

  translateSelect.dispatchEvent(new Event("change"));
  languageStatus.hidden = language === "en";
  languageStatus.textContent = language === "en"
    ? ""
    : "Page translation powered by Google Translate. Automated translations may not be exact.";
  updateDisplayedPrices(currencySelect.value);
  if (window.lucide) lucide.createIcons();
}

window.googleTranslateElementInit = () => {
  new google.translate.TranslateElement({
    pageLanguage: "en",
    includedLanguages: "zh-CN,ur,ja,ko,id,fr,de,es",
    autoDisplay: false
  }, "google_translate_element");

  const translationEngine = document.getElementById("google_translate_element");
  const onTranslationWidgetReady = () => {
    const translateSelect = document.querySelector(".goog-te-combo");
    const availableLanguages = new Set(Array.from(translateSelect?.options || [], option => option.value));
    const requiredLanguages = Object.values(googleLanguageCodes).filter(language => language !== "en");
    if (!requiredLanguages.every(language => availableLanguages.has(language))) return;
    translationWidgetReady = true;
    observer.disconnect();
    if (languageSelect.value !== "en") {
      applySelectedLanguage();
    }
  };
  const observer = new MutationObserver(onTranslationWidgetReady);
  observer.observe(translationEngine, { childList: true, subtree: true });
  onTranslationWidgetReady();

  if (languageSelect.value === "en") {
    languageStatus.hidden = true;
  } else {
    languageStatus.hidden = false;
    languageStatus.textContent = "Loading the translation service…";
  }
};

const translationScript = document.createElement("script");
translationScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
translationScript.async = true;
translationScript.onerror = () => {
  languageStatus.hidden = false;
  languageStatus.textContent = "The translation service could not be loaded. The page remains in English.";
  console.error("Unable to load Google Translate.");
};
document.head.append(translationScript);

languageSelect.addEventListener("change", () => {
  applySelectedLanguage();
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  if (window.lucide) lucide.createIcons();
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  });
});

// Reveal content as it enters the viewport.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Highlight the navigation item for the current section.
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => sectionObserver.observe(section));

document.getElementById("year").textContent = new Date().getFullYear();
if (window.lucide) lucide.createIcons();

const currencySelect = document.getElementById("currencySelect");
const currencyStatus = document.getElementById("currencyStatus");
const currencyRetry = document.getElementById("currencyRetry");
const priceTableCurrency = document.getElementById("priceTableCurrency");
const currencyStorageKey = "gn-solutions-currency";
let exchangeRates = null;
let ratesUpdatedAt = "";
let requestedCurrency = "PKR";

try {
  const savedCurrency = localStorage.getItem(currencyStorageKey);
  if (savedCurrency && Array.from(currencySelect.options).some(option => option.value === savedCurrency)) {
    requestedCurrency = savedCurrency;
  }
} catch (error) {
  console.error("Unable to read the saved currency preference.", error);
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat(languageLocales[languageSelect.value], {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 2
  }).format(amount);
}

function updateDisplayedPrices(currency) {
  const rate = currency === "PKR" ? 1 : exchangeRates && exchangeRates[currency];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`A valid live exchange rate for ${currency} is unavailable.`);
  }

  document.querySelectorAll(".price-amount, .price-table-value").forEach(element => {
    const minimum = Number(element.dataset.priceMin) * rate;
    const maximum = element.dataset.priceMax ? Number(element.dataset.priceMax) * rate : null;
    const minimumText = formatPrice(minimum, currency);
    const maximumText = maximum === null ? "" : formatPrice(maximum, currency);
    const mode = element.dataset.priceMode;
    let priceText = minimumText;

    if (mode === "starting") {
      priceText = `Starting at ${minimumText}`;
    } else if (maximumText) {
      priceText = `${minimumText}–${maximumText}${mode === "range-plus" ? "+" : ""}`;
    }

    element.textContent = priceText;
  });

  currencySelect.value = currency;
  priceTableCurrency.textContent = `Price (${currency})`;
}

function selectCurrency(currency) {
  updateDisplayedPrices(currency);
  requestedCurrency = currency;
  try {
    localStorage.setItem(currencyStorageKey, currency);
  } catch (error) {
    console.error("Unable to save the currency preference.", error);
  }

  if (currency === "PKR") {
    currencyStatus.textContent = "Prices shown in PKR. Foreign currency estimates use live rates and final quotes are confirmed in PKR.";
  } else {
    currencyStatus.textContent = `Indicative live conversion from PKR via open.er-api.com${ratesUpdatedAt ? ` (rates updated ${new Date(ratesUpdatedAt).toLocaleString(languageLocales[languageSelect.value])})` : ""}. Final quotes are confirmed in PKR.`;
  }
}

async function loadExchangeRates() {
  currencyRetry.hidden = true;
  currencyStatus.textContent = "Loading live exchange rates; prices remain in PKR until rates are available.";
  const foreignOptions = Array.from(currencySelect.options).filter(option => option.value !== "PKR");
  foreignOptions.forEach(option => { option.disabled = true; });

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/PKR", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Exchange-rate service returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (data.result !== "success" || data.base_code !== "PKR" || !data.rates) {
      throw new Error("Exchange-rate service returned an invalid PKR rate table.");
    }

    exchangeRates = data.rates;
    foreignOptions.forEach(option => {
      option.disabled = !Number.isFinite(exchangeRates[option.value]) || exchangeRates[option.value] <= 0;
    });
    ratesUpdatedAt = data.time_last_update_utc || "";

    const currency = requestedCurrency !== "PKR" && !currencySelect.querySelector(`option[value="${requestedCurrency}"]`).disabled
      ? requestedCurrency
      : "PKR";
    selectCurrency(currency);
    if (currency === "PKR" && requestedCurrency !== "PKR") {
      currencyStatus.textContent = "The saved currency has no live rate right now. Prices are shown in PKR.";
    }
  } catch (error) {
    console.error("Unable to load live exchange rates.", error);
    exchangeRates = null;
    currencySelect.value = "PKR";
    updateDisplayedPrices("PKR");
    currencyStatus.textContent = "Live exchange rates are unavailable. Prices are shown in PKR; try again when you are online.";
    currencyRetry.hidden = false;
  }
}

currencySelect.addEventListener("change", () => {
  try {
    selectCurrency(currencySelect.value);
  } catch (error) {
    console.error("Unable to update prices for the selected currency.", error);
    currencyStatus.textContent = "The selected currency could not be applied. Prices remain in PKR.";
    currencySelect.value = "PKR";
    updateDisplayedPrices("PKR");
  }
});

languageSelect.addEventListener("change", () => {
  try {
    updateDisplayedPrices(currencySelect.value);
    if (currencySelect.value !== "PKR" && ratesUpdatedAt) {
      currencyStatus.textContent = `Indicative live conversion from PKR via open.er-api.com (rates updated ${new Date(ratesUpdatedAt).toLocaleString(languageLocales[languageSelect.value])}). Final quotes are confirmed in PKR.`;
    }
  } catch (error) {
    console.error("Unable to reformat prices for the selected language.", error);
  }
});

currencyRetry.addEventListener("click", loadExchangeRates);
loadExchangeRates();

const inquiryForm = document.getElementById("inquiryForm");
const inquiryStatus = document.getElementById("inquiryStatus");
const serviceSelect = inquiryForm.querySelector('select[name="service"]');

document.querySelectorAll(".quote-package").forEach(link => {
  link.addEventListener("click", () => {
    const option = Array.from(serviceSelect.options).find(item => item.value === link.dataset.service);
    if (!option) {
      console.error(`No inquiry form option matches pricing package "${link.dataset.service}".`);
      return;
    }
    serviceSelect.value = option.value;
  });
});

inquiryForm.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(inquiryForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const service = formData.get("service");
  const details = formData.get("details").trim();
  const message = [
    "Hello GN Solutions, I'd like to discuss a project.",
    `Name: ${name}`,
    `Email: ${email}`,
    `Service: ${service}`,
    "",
    "Project details:",
    details
  ].join("\n");

  inquiryStatus.textContent = "WhatsApp is opening with your enquiry. Review the message and press Send to contact us.";
  window.location.href = `https://wa.me/923167160597?text=${encodeURIComponent(message)}`;
});
