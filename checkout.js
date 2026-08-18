/* Renu Store Pro - checkout.js */
"use strict";

const CHECKOUT_CART_KEY = "renuStoreCart";
const CHECKOUT_DISCOUNT_KEY = "renuStoreDiscount";

function checkoutCart() {
    return JSON.parse(localStorage.getItem(CHECKOUT_CART_KEY)) || [];
}

function checkoutTotals() {
    const cart = checkoutCart();
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const delivery = subtotal >= 500 ? 0 : (subtotal > 0 ? 40 : 0);
    const discount = Math.min(Number(sessionStorage.getItem(CHECKOUT_DISCOUNT_KEY) || 0), subtotal + delivery);
    return { subtotal, delivery, discount, total: Math.max(0, subtotal + delivery - discount) };
}

function renderCheckoutSummary() {
    const cart = checkoutCart();
    const totals = checkoutTotals();

    const subtotal = document.querySelector(".checkout-subtotal");
    const delivery = document.querySelector(".checkout-delivery");
    const total = document.querySelector(".checkout-total");

    if (subtotal) subtotal.textContent = `₹${totals.subtotal}`;
    if (delivery) delivery.textContent = `₹${totals.delivery}`;
    if (total) total.textContent = `₹${totals.total}`;

    if (!cart.length) {
        const button = document.querySelector(".place-order-btn");
        if (button) button.disabled = true;
        if (typeof showToast === "function") showToast("🛒 Your cart is empty");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();

    const form = document.querySelector("#checkoutForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const cart = checkoutCart();
        if (!cart.length) {
            if (typeof showToast === "function") showToast("🛒 Your cart is empty");
            return;
        }

        const name = document.querySelector("#customerName")?.value.trim();
        const phone = document.querySelector("#customerPhone")?.value.trim();
        const email = document.querySelector("#customerEmail")?.value.trim();
        const address = document.querySelector("#customerAddress")?.value.trim();
        const city = document.querySelector("#customerCity")?.value.trim();
        const pincode = document.querySelector("#customerPincode")?.value.trim();

        if (!name || !phone || !address || !city || !pincode) {
            if (typeof showToast === "function") showToast("❌ Please fill all required details");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
            if (typeof showToast === "function") showToast("❌ Enter a valid 10-digit mobile number");
            return;
        }

        if (!/^\d{6}$/.test(pincode)) {
            if (typeof showToast === "function") showToast("❌ Enter a valid 6-digit pincode");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (typeof showToast === "function") showToast("❌ Enter a valid email");
            return;
        }

        const totals = checkoutTotals();
        const order = {
            id: "RS" + Date.now(),
            customer: { name, phone, email, address, city, pincode },
            items: cart,
            subtotal: totals.subtotal,
            delivery: totals.delivery,
            discount: totals.discount,
            total: totals.total,
            status: "Placed",
            createdAt: new Date().toISOString()
        };

        localStorage.setItem("renuStoreLastOrder", JSON.stringify(order));
        localStorage.removeItem(CHECKOUT_CART_KEY);
        sessionStorage.removeItem(CHECKOUT_DISCOUNT_KEY);
        sessionStorage.removeItem("renuStoreCoupon");

        if (typeof showToast === "function") showToast("✅ Order placed successfully");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    });
});
