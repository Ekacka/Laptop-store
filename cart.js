function addToCart(model, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = { name: model, price: price };
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${model} added to cart!`);
}

// Ensure DOM is loaded before modifying UI
document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Please log in first.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];

    function updateCartUI() {
        const cartContainer = document.getElementById("cart-items");
        const totalPriceEl = document.getElementById("total-price");
        const orderBtn = document.getElementById("place-order");

        if (!cartContainer) return;

        cartContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <p>${item.name} - $${item.price}</p>
                    <button class="remove" data-index="${index}">Remove</button>
                </div>
            `;
        });

        totalPriceEl.textContent = `Total: $${total}`;
        orderBtn.style.display = cart.length > 0 ? "block" : "none";

        localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    }

    document.getElementById("cart-items")?.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove")) {
            const index = e.target.getAttribute("data-index");
            cart.splice(index, 1);
            localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
            updateCartUI();
        }
    });

    document.getElementById("place-order")?.addEventListener("click", async function () {
        if (!username) {
            alert("Please log in first.");
            return;
        }

        let orderData = {
            username: username, // ✅ Use username instead of userId
            laptops: cart,
            total: cart.reduce((sum, item) => sum + item.price, 0),
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(orderData),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Order placed successfully!");
                localStorage.removeItem(`cart_${username}`);
                location.reload();
            } else {
                alert("Order failed: " + data.error);
            }
        } catch (error) {
            console.error("Order error:", error);
        }
    });

    updateCartUI();
});

