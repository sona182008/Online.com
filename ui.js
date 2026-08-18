/* Renu Store Pro — ui.js: small progressive enhancements */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-accordion-button]").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.nextElementSibling;
            const expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            if (panel) panel.hidden = expanded;
        });
    });

    document.querySelectorAll("[data-modal-open]").forEach(trigger => {
        trigger.addEventListener("click", () => {
            const modal = document.getElementById(trigger.dataset.modalOpen);
            if (modal) modal.hidden = false;
        });
    });

    document.querySelectorAll("[data-modal-close]").forEach(trigger => {
        trigger.addEventListener("click", () => {
            const modal = trigger.closest("[role='dialog']");
            if (modal) modal.hidden = true;
        });
    });
});
