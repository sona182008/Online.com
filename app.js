/* Renu Store Pro — app.js */
"use strict";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function showToast(message) {
    let toast = qs("#siteToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "siteToast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
window.showToast = showToast;

function updateActiveNavigation() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    qsa(".navbar a, .nav-links a").forEach(link => {
        const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
        link.classList.toggle("active", href === current);
    });
}

function initMobileMenu() {
    const toggles = qsa(".menu-toggle");
    toggles.forEach(toggle => {
        const nav = toggle.closest(".header, .modern-header")?.querySelector(".navbar");
        if (!nav) return;
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("show");
            toggle.classList.toggle("active", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        });
        qsa("a", nav).forEach(link => link.addEventListener("click", () => {
            nav.classList.remove("show");
            toggle.classList.remove("active");
            toggle.setAttribute("aria-expanded", "false");
        }));
    });
}

function initHeader() {
    const headers = qsa(".header, .modern-header");
    const onScroll = () => headers.forEach(header => header.classList.toggle("sticky", window.scrollY > 20));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

function initBackToTop() {
    let button = qs("#topBtn");
    if (!button) {
        button = document.createElement("button");
        button.id = "topBtn";
        button.type = "button";
        button.setAttribute("aria-label", "Back to top");
        button.textContent = "↑";
        document.body.appendChild(button);
    }
    const update = () => { button.style.display = window.scrollY > 400 ? "flex" : "none"; };
    update();
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initSmoothLinks() {
    qsa('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", event => {
            const target = qs(anchor.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function initReveal() {
    const elements = qsa(".modern-section, .hero-modern, .product-card, .modern-product, .benefit, .offer-card, .modern-testimonial");
    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("fade-up"));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-up");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    elements.forEach(el => observer.observe(el));
}

const Storage = {
    get(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; }
        catch { return []; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

function addToWishlist(product) {
    const wishlist = Storage.get("wishlist");
    if (!wishlist.some(item => item.id === product.id)) {
        wishlist.push(product);
        Storage.set("wishlist", wishlist);
        showToast("♥ Added to wishlist");
    } else {
        showToast("Already in wishlist");
    }
    if (typeof updateWishlistCount === "function") updateWishlistCount();
}
window.addToWishlist = addToWishlist;

function removeFromWishlist(productId) {
    Storage.set("wishlist", Storage.get("wishlist").filter(item => item.id !== productId));
    if (typeof renderWishlist === "function") renderWishlist();
    if (typeof updateWishlistCount === "function") updateWishlistCount();
}
window.removeFromWishlist = removeFromWishlist;

function saveRecentlyViewed(product) {
    let recent = Storage.get("recentProducts").filter(item => item.id !== product.id);
    recent.unshift(product);
    Storage.set("recentProducts", recent.slice(0, 10));
}
function getRecentlyViewed() { return Storage.get("recentProducts"); }
function quickView(product) { showToast(`Viewing ${product?.name || "product"}`); }

function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}
function throttle(func, limit = 200) {
    let waiting = false;
    return (...args) => {
        if (waiting) return;
        func(...args);
        waiting = true;
        setTimeout(() => waiting = false, limit);
    };
}
function safeAddEvent(element, event, callback) {
    if (element) element.addEventListener(event, callback);
}
window.debounce = debounce;
window.throttle = throttle;
window.safeAddEvent = safeAddEvent;

document.addEventListener("DOMContentLoaded", () => {
    updateActiveNavigation();
    initMobileMenu();
    initHeader();
    initBackToTop();
    initSmoothLinks();
    initReveal();

    qsa("img").forEach(img => {
        img.loading = img.loading || "lazy";
        img.addEventListener("error", () => {
            if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = "1";
                img.src = "favicon.png";
            }
        });
    });
});

window.addEventListener("offline", () => showToast("You are offline"));
window.addEventListener("online", () => showToast("Back online"));
