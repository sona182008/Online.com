/* ==========================================
   Renu Store Pro - cart.js
   Part 1 : Cart Base
========================================== */

"use strict";

/* ==========================================
   LOCAL STORAGE
========================================== */

const CART_KEY = "renuStoreCart";

/* ==========================================
   GET CART
========================================== */

function getCart(){

    return JSON.parse(localStorage.getItem(CART_KEY)) || [];

}

/* ==========================================
   SAVE CART
========================================== */

function saveCart(cart){

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

}

/* ==========================================
   ADD TO CART
========================================== */

function addToCart(product){

    let cart = getCart();
    const normalized = {
        id: product.id ?? product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || "favicon.png"
    };
    const existing = cart.find(item => String(item.id) === String(normalized.id));

    if(existing){

        existing.quantity += 1;

    }else{

        cart.push({
            ...normalized,
            quantity: 1
        });

    }

    saveCart(cart);

    if(typeof showToast === "function"){

        showToast("🛒 Product added to cart");

    }

    updateCartCount();

}

/* ==========================================
   CART COUNT
========================================== */

function updateCartCount(){

    const badge = document.querySelector(".cart-count");

    if(!badge) return;

    const cart = getCart();

    const total = cart.reduce((sum,item)=>sum + item.quantity,0);

    badge.textContent = total;

}

document.addEventListener("DOMContentLoaded", updateCartCount);
/* ==========================================
   PART 2 : CART OPERATIONS
========================================== */

/* ========= INCREASE QUANTITY ========= */

function increaseQuantity(productId){

    let cart = getCart();

    cart = cart.map(item => {

        if(item.id === productId){
            item.quantity += 1;
        }

        return item;

    });

    saveCart(cart);

    renderCart();

    updateCartCount();

}

/* ========= DECREASE QUANTITY ========= */

function decreaseQuantity(productId){

    let cart = getCart();

    cart = cart.map(item => {

        if(item.id === productId && item.quantity > 1){
            item.quantity -= 1;
        }

        return item;

    });

    saveCart(cart);

    renderCart();

    updateCartCount();

}

/* ========= REMOVE PRODUCT ========= */

function removeFromCart(productId){

    let cart = getCart();

    cart = cart.filter(item => item.id !== productId);

    saveCart(cart);

    renderCart();

    updateCartCount();

    if(typeof showToast === "function"){

        showToast("🗑️ Product removed from cart");

    }

}

/* ========= CLEAR CART ========= */

function clearCart(){

    localStorage.removeItem(CART_KEY);
    sessionStorage.removeItem("renuStoreDiscount");
    sessionStorage.removeItem("renuStoreCoupon");

    renderCart();

    updateCartCount();

    if(typeof showToast === "function"){

        showToast("🛒 Cart cleared");

    }

}
/* ==========================================
   PART 3 : RENDER CART & TOTALS
========================================== */

const cartContainer = document.querySelector(".cart-items");
const subtotalElement = document.querySelector(".subtotal");
const deliveryElement = document.querySelector(".delivery-charge");
const totalElement = document.querySelector(".grand-total");

const DELIVERY_CHARGE = 40;

/* ========= CALCULATE TOTAL ========= */

function calculateSubtotal(){

    const cart = getCart();

    return cart.reduce((total,item)=>{

        return total + (item.price * item.quantity);

    },0);

}

/* ========= UPDATE TOTALS ========= */

function updateCartTotals(){

    if(!subtotalElement || !deliveryElement || !totalElement) return;

    const subtotal = calculateSubtotal();

    const delivery = subtotal > 0 ? DELIVERY_CHARGE : 0;

    const grandTotal = subtotal + delivery;

    subtotalElement.textContent = `₹${subtotal}`;

    deliveryElement.textContent = `₹${delivery}`;

    totalElement.textContent = `₹${grandTotal}`;

}

/* ========= RENDER CART ========= */

function renderCart(){

    if(!cartContainer) return;

    const cart = getCart();

    if(cart.length===0){

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your Cart is Empty</h2>
                <p>Add products to continue shopping.</p>
            </div>
        `;

        updateCartTotals();

        return;

    }

    cartContainer.innerHTML = "";

    cart.forEach(item=>{

        const card = document.createElement("div");

        card.className = "cart-item";

        card.innerHTML = `

            <img src="${item.image}" alt="${item.name}">

            <div class="cart-info">

                <h3>${item.name}</h3>

                <p>₹${item.price}</p>

            </div>

            <div class="cart-qty">

                <button onclick="decreaseQuantity(${JSON.stringify(item.id)})">−</button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity(${JSON.stringify(item.id)})">+</button>

            </div>

            <div class="cart-price">

                ₹${item.price * item.quantity}

            </div>

            <button class="remove-btn"
                onclick="removeFromCart(${JSON.stringify(item.id)})">
                ✖
            </button>

        `;

        cartContainer.appendChild(card);

    });

    updateCartTotals();

}

/* ========= INITIAL LOAD ========= */

document.addEventListener("DOMContentLoaded",()=>{

    renderCart();

    updateCartTotals();

});
/* ==========================================
   PART 4 : COUPON & CHECKOUT
========================================== */

const couponInput = document.querySelector("#couponCode");
const applyCouponBtn = document.querySelector("#applyCoupon");

let discount = Number(sessionStorage.getItem("renuStoreDiscount") || 0);

/* ========= APPLY COUPON ========= */

function applyCoupon(){

    if(!couponInput) return;

    const code = couponInput.value.trim().toUpperCase();

    const subtotal = calculateSubtotal();

    switch(code){

        case "WELCOME10":
            discount = subtotal * 0.10;
            break;

        case "SAVE20":
            discount = subtotal * 0.20;
            break;

        case "FREESHIP":
            discount = subtotal > 0 ? Math.min(40, subtotal >= 500 ? 0 : DELIVERY_CHARGE) : 0;
            break;

        default:
            discount = 0;

            if(typeof showToast === "function"){
                showToast("❌ Invalid Coupon Code");
            }

            updateCartTotals();
            return;
    }

    if(typeof showToast === "function"){
        showToast("✅ Coupon Applied Successfully");
    }

    sessionStorage.setItem("renuStoreDiscount", String(discount));
    sessionStorage.setItem("renuStoreCoupon", code);
    updateCartTotals();

}

/* ========= UPDATE TOTALS ========= */

const originalUpdateCartTotals = updateCartTotals;

updateCartTotals = function(){

    if(!subtotalElement || !deliveryElement || !totalElement) return;

    const subtotal = calculateSubtotal();

    const delivery = subtotal >= 500 ? 0 : (subtotal > 0 ? DELIVERY_CHARGE : 0);

    const grandTotal = subtotal + delivery - discount;

    subtotalElement.textContent = `₹${subtotal}`;
    deliveryElement.textContent = `₹${delivery}`;
    totalElement.textContent = `₹${Math.max(grandTotal,0)}`;

};

/* ========= APPLY BUTTON ========= */

if(applyCouponBtn){

    applyCouponBtn.addEventListener("click", applyCoupon);

}

/* ========= CHECKOUT ========= */

function proceedToCheckout(){

    const cart = getCart();

    if(cart.length === 0){

        if(typeof showToast === "function"){
            showToast("🛒 Your cart is empty");
        }

        return;
    }

    window.location.href = "checkout.html";

}

/* ==========================================
   PART 5 : FINAL UTILITIES
========================================== */

/* ========= EXPORT CART ========= */

function exportCart(){

    const cart = getCart();

    const data = JSON.stringify(cart, null, 2);

    const blob = new Blob([data], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "RenuStoreCart.json";

    a.click();

    URL.revokeObjectURL(url);

}

/* ========= IMPORT CART ========= */

function importCart(file){

    const reader = new FileReader();

    reader.onload = function(e){

        try{

            const cart = JSON.parse(e.target.result);

            saveCart(cart);

            renderCart();

            updateCartCount();

            updateCartTotals();

            if(typeof showToast==="function"){

                showToast("✅ Cart Imported");

            }

        }catch(error){

            if(typeof showToast==="function"){

                showToast("❌ Invalid Cart File");

            }

        }

    };

    reader.readAsText(file);

}

/* ========= EMPTY CART CHECK ========= */

function isCartEmpty(){

    return getCart().length === 0;

}

/* ========= FINAL INIT ========= */

document.addEventListener("DOMContentLoaded",()=>{

    updateCartCount();

    renderCart();

    updateCartTotals();

    console.log("🛒 Cart System Ready");

});