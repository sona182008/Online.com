/* Renu Store Pro — search.js */
"use strict";

const SEARCH_HISTORY_KEY = "renuStoreSearchHistory";

function getSearchHistory() {
    try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || []; }
    catch { return []; }
}
function saveSearchHistory(term) {
    const value = String(term || "").trim();
    if (!value) return;
    const next = [value, ...getSearchHistory().filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    showSearchHistory();
}
function showSearchHistory() {
    const box = document.querySelector(".search-history");
    if (!box) return;
    box.innerHTML = "";
    getSearchHistory().forEach(term => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "history-item";
        item.textContent = term;
        item.addEventListener("click", () => {
            const input = document.querySelector("#searchInput");
            if (input) input.value = term;
            searchProducts(term);
        });
        box.appendChild(item);
    });
}
function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    showSearchHistory();
}
window.clearSearchHistory = clearSearchHistory;

function searchProducts(keyword) {
    const input = document.querySelector("#searchInput");
    const term = String(keyword ?? input?.value ?? "").trim().toLowerCase();
    const cards = [...document.querySelectorAll(".product-card")];
    let visible = 0;

    cards.forEach(card => {
        const name = (card.dataset.name || "").toLowerCase();
        const category = (card.dataset.category || "").toLowerCase();
        const matches = !term || name.includes(term) || category.includes(term);
        card.hidden = !matches;
        if (matches) visible++;
    });

    const empty = document.querySelector("#noResults");
    if (empty) empty.style.display = visible ? "none" : "block";
    return visible;
}
window.searchProducts = searchProducts;

function filterProducts() {
    const category = document.querySelector("#categoryFilter")?.value || "all";
    const price = document.querySelector("#priceFilter")?.value || "all";
    const term = (document.querySelector("#searchInput")?.value || "").trim().toLowerCase();

    document.querySelectorAll(".product-card").forEach(card => {
        const value = Number(card.dataset.price || 0);
        const name = (card.dataset.name || "").toLowerCase();
        const cat = (card.dataset.category || "").toLowerCase();
        const categoryOK = category === "all" || cat === category;
        const priceOK = price === "all" || (price === "low" && value <= 100) || (price === "medium" && value > 100 && value <= 500) || (price === "high" && value > 500);
        const searchOK = !term || name.includes(term) || cat.includes(term);
        card.hidden = !(categoryOK && priceOK && searchOK);
    });
    updateNoResults();
}
window.filterProducts = filterProducts;

function sortProducts() {
    const grid = document.querySelector(".product-grid");
    const select = document.querySelector("#sortProducts");
    if (!grid || !select) return;
    const cards = [...grid.querySelectorAll(".product-card")];
    const value = select.value;
    cards.sort((a,b) => {
        const ap = Number(a.dataset.price || 0), bp = Number(b.dataset.price || 0);
        const an = a.dataset.name || "", bn = b.dataset.name || "";
        return value === "price-low" ? ap-bp : value === "price-high" ? bp-ap : value === "name-a-z" ? an.localeCompare(bn) : value === "name-z-a" ? bn.localeCompare(an) : 0;
    });
    cards.forEach(card => grid.appendChild(card));
}
window.sortProducts = sortProducts;

function updateNoResults() {
    const cards = [...document.querySelectorAll(".product-card")];
    const empty = document.querySelector("#noResults");
    if (empty) empty.style.display = cards.some(card => !card.hidden) ? "none" : "block";
}

function resetFilters() {
    const category = document.querySelector("#categoryFilter");
    const price = document.querySelector("#priceFilter");
    const sort = document.querySelector("#sortProducts");
    if (category) category.value = "all";
    if (price) price.value = "all";
    if (sort) sort.value = "default";
    const input = document.querySelector("#searchInput");
    if (input) input.value = "";
    document.querySelectorAll(".product-card").forEach(card => card.hidden = false);
    updateNoResults();
}
window.resetFilters = resetFilters;

function clearSearch() {
    const input = document.querySelector("#searchInput");
    if (input) input.value = "";
    searchProducts("");
}
window.clearSearch = clearSearch;

document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#searchInput");
    const category = document.querySelector("#categoryFilter");
    const price = document.querySelector("#priceFilter");
    const sort = document.querySelector("#sortProducts");
    const suggestions = document.querySelector(".suggestion-box");

    input?.addEventListener("input", () => {
        searchProducts(input.value);
        if (suggestions) {
            const term = input.value.trim().toLowerCase();
            const names = [...document.querySelectorAll(".product-card")].map(c => c.dataset.name).filter(Boolean);
            const matches = names.filter(name => name.toLowerCase().includes(term)).slice(0,5);
            suggestions.innerHTML = matches.map(name => `<button type="button" class="suggestion-item">${name}</button>`).join("");
            suggestions.style.display = term && matches.length ? "block" : "none";
            suggestions.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
                input.value = btn.textContent;
                searchProducts(input.value);
                suggestions.style.display = "none";
            }));
        }
    });
    category?.addEventListener("change", filterProducts);
    price?.addEventListener("change", filterProducts);
    sort?.addEventListener("change", sortProducts);
    showSearchHistory();
    document.querySelector(".search-btn")?.addEventListener("click", () => saveSearchHistory(input?.value || ""));
});
