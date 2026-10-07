const symbols = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  CHF: "₣",
  KZT: "₸",
  UAH: "₴",
  BYN: "Br",
  AMD: "֏",
  TRY: "₺",
  KRW: "₩",
  INR: "₹",
};

const screenMain = document.getElementById("screen-main");
const screenSelect = document.getElementById("screen-select");
const topAmountEl = document.getElementById("top-amount");
const bottomAmountEl = document.getElementById("bottom-amount");
const topCodeEl = document.getElementById("top-code");
const topNameEl = document.getElementById("top-name");
const bottomCodeEl = document.getElementById("bottom-code");
const bottomNameEl = document.getElementById("bottom-name");
const currencyListEl = document.getElementById("currency-list");
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");
const backBtn = document.getElementById("back-btn");
const keypad = document.getElementById("keypad");

let topCurrency = findCurrency("RUB");
let bottomCurrency = findCurrency("USD");
let activeField = "top";
let topValue = "0";
let bottomValue = "0";
let selectSlot = "top";

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === "digit") {
    inputDigit(value);
  } else if (action === "ac") {
    allClear();
  } else if (action === "backspace") {
    backspace();
  }
});

document.querySelectorAll("[data-active-field]").forEach((el) => {
  el.addEventListener("click", () => {
    setActiveField(el.dataset.activeField);
  });
});

document.querySelectorAll("[data-open]").forEach((el) => {
  el.addEventListener("click", () => {
    openSelect(el.dataset.open);
  });
});

backBtn.addEventListener("click", closeSelect);

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  filterCurrencies();
  searchInput.focus();
});

searchInput.addEventListener("change", (e) => {
  filterCurrencies();
});

searchInput.addEventListener("input", (e) => {
  filterCurrencies();
});

document.addEventListener("keydown", (event) => {
  if (!screenSelect.classList.contains("hidden")) return;

  const key = event.key;
  if (key >= "0" && key <= "9") {
    event.preventDefault();
    inputDigit(key);
  } else if (key === "," || key === ".") {
    event.preventDefault();
    inputDigit(",");
  } else if (key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    allClear();
  }
});

function findCurrency(code) {
  return currencyList.find((item) => item.CharCode === code);
}

function getSymbol(currency) {
  return symbols[currency.CharCode] || currency.CharCode;
}

function toNumber(str) {
  return parseFloat(String(str).replace(",", ".")) || 0;
}

function toDisplay(num) {
  if (!isFinite(num)) return "0";
  let str = num.toFixed(2);
  str = str.replace(/\.?0+$/, "");
  return str.replace(".", ",");
}

function rateToRub(currency) {
  return currency.Value / currency.Nominal;
}

function convert(amount, from, to) {
  const inRub = amount * rateToRub(from);
  return inRub / rateToRub(to);
}

function formatAmount(valueStr, currency) {
  return valueStr + getSymbol(currency);
}

function updateView() {
  topCodeEl.textContent = topCurrency.CharCode;
  topNameEl.textContent = topCurrency.Name;
  bottomCodeEl.textContent = bottomCurrency.CharCode;
  bottomNameEl.textContent = bottomCurrency.Name;

  topAmountEl.textContent = formatAmount(topValue, topCurrency);
  bottomAmountEl.textContent = formatAmount(bottomValue, bottomCurrency);

  topAmountEl.classList.toggle("active", activeField === "top");
  bottomAmountEl.classList.toggle("active", activeField === "bottom");
}

function recalculate() {
  if (activeField === "top") {
    const result = convert(toNumber(topValue), topCurrency, bottomCurrency);
    bottomValue = toDisplay(result);
  } else {
    const result = convert(toNumber(bottomValue), bottomCurrency, topCurrency);
    topValue = toDisplay(result);
  }
  updateView();
}

function setActiveField(field) {
  activeField = field;
  updateView();
}

function getActiveValue() {
  return activeField === "top" ? topValue : bottomValue;
}

function setActiveValue(value) {
  if (activeField === "top") {
    topValue = value;
  } else {
    bottomValue = value;
  }
}

function inputDigit(digit) {
  let current = getActiveValue();

  if (digit === ",") {
    if (current.includes(",")) return;
    current += ",";
    setActiveValue(current);
    recalculate();
    return;
  }

  if (current === "0") {
    current = digit;
  } else {
    current += digit;
  }

  setActiveValue(current);
  recalculate();
}

function allClear() {
  setActiveValue("0");
  recalculate();
}

function backspace() {
  let current = getActiveValue();
  current = current.slice(0, -1);
  if (current === "" || current === "-") {
    current = "0";
  }
  setActiveValue(current);
  recalculate();
}

function openSelect(slot) {
  selectSlot = slot;
  searchInput.value = "";
  renderCurrencyList(currencyList);
  screenMain.classList.add("hidden");
  screenSelect.classList.remove("hidden");
}

function closeSelect() {
  screenSelect.classList.add("hidden");
  screenMain.classList.remove("hidden");
}

function renderCurrencyList(list) {
  currencyListEl.innerHTML = "";

  list.forEach((currency) => {
    const selected =
      currency.CharCode === topCurrency.CharCode ||
      currency.CharCode === bottomCurrency.CharCode;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "currency-item" + (selected ? " selected" : "");
    button.innerHTML =
      "<span>" +
      '<span class="item-code">' + currency.CharCode + "</span>" +
      '<span class="item-name">' + currency.Name + "</span>" +
      "</span>" +
      '<span class="check">✓</span>';

    button.addEventListener("click", () => {
      chooseCurrency(currency);
    });

    currencyListEl.appendChild(button);
  });
}

function chooseCurrency(currency) {
  if (selectSlot === "top") {
    if (currency.CharCode === bottomCurrency.CharCode) {
      bottomCurrency = topCurrency;
    }
    topCurrency = currency;
  } else {
    if (currency.CharCode === topCurrency.CharCode) {
      topCurrency = bottomCurrency;
    }
    bottomCurrency = currency;
  }

  recalculate();
  closeSelect();
}

function filterCurrencies() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = currencyList.filter((currency) => {
    const code = currency.CharCode.toLowerCase();
    const name = currency.Name.toLowerCase();
    return code.includes(query) || name.includes(query);
  });

  renderCurrencyList(filtered);
}

recalculate();
