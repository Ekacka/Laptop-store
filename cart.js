function addToCart(model, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: model, price: price });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartUI();
}

// Ensure DOM is loaded before modifying UI
document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.querySelector("#cart-items");
    const totalPriceEl = document.querySelector("#total-price");
    const orderBtn = document.querySelector("#place-order");

    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function updateCartUI() {
        const cart = getCart();
        if (!cartContainer || !totalPriceEl || !orderBtn) return;

        cartContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <p>${item.name} - $${item.price.toFixed(2)}</p>
                    <button class="remove" data-index="${index}">Remove</button>
                </div>
            `;
        });

        totalPriceEl.textContent = `Total: $${total.toFixed(2)}`;
        orderBtn.style.display = cart.length > 0 ? "block" : "none";
    }

    cartContainer?.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove")) {
            let cart = getCart();
            const index = e.target.getAttribute("data-index");
            cart.splice(index, 1);

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartUI();
        }
    });

    // ✅ Исправленный обработчик "Place Order"
    orderBtn?.addEventListener("click", async function () {
        const cart = getCart();
        const username = localStorage.getItem("username"); 
        
        console.log("Username from localStorage:", username); // <--- Отладка

        if (!username) {
            alert("Please log in first.");
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        try {
            const res = await fetch("http://localhost:3030/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: username,  // ✅ Используем username вместо userId
                    laptops: cart,
                    total: cart.reduce((sum, item) => sum + item.price, 0),
                }),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Order placed successfully!");
                localStorage.removeItem("cart");
                updateCartUI();
            } else {
                alert("Order failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Order error:", error);
            alert("Something went wrong. Please try again.");
        }
    });

    updateCartUI();
});
