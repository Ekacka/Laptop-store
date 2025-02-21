let laptopsData = []; 
let token = "";

async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Username and password cannot be empty.");
        return;
    }

    const res = await fetch("http://localhost:3030/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message || "Registration successful! Logging in...");
        login(); 
    } else {
        alert("Registration failed: " + data.error);
    }
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Username and password cannot be empty.");
        return;
    }

    const res = await fetch("http://localhost:3030/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);  

        document.getElementById("auth").style.display = "none";
        document.getElementById("laptop-section").style.display = "block";

        loadLaptops();
    } else {
        alert("Login failed: " + data.error);
    }
}

async function loadLaptops() {
    const searchQuery = document.getElementById("searchModel").value.trim();
    let url = "http://localhost:3030/api/laptops";

    if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    const res = await fetch(url);
    laptopsData = await res.json();

    populateFilters();
    displayLaptops(laptopsData);
}


function displayLaptops(laptops) {
    const laptopsDiv = document.getElementById("laptops");
    laptopsDiv.innerHTML = "";

    if (laptops.length === 0) {
        laptopsDiv.innerHTML = "<p>No laptops found.</p>";
        return;
    }

    laptops.forEach(laptop => {
        laptopsDiv.innerHTML += `
            <div class="laptop-card">
                <h3>${laptop.brand} ${laptop.model}</h3>
                <p><b>Price:</b> $${laptop.price}</p>
                <p><b>Processor:</b> ${laptop.processor}</p>
                <p><b>RAM:</b> ${laptop.ram}</p>
                <button class="btn btn-primary" onclick="addToCart('${laptop.model}', ${laptop.price})">Add to Cart</button>
            </div>
        `;
    });
}

function addToCart(model, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ name: model, price: price });
    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").textContent = cart.length;
}

function applyFilters() {
    let filteredLaptops = laptopsData;

    const brand = document.getElementById("brandFilter").value;
    const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
    const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;
    const ram = document.getElementById("ramFilter").value;

    if (brand) {
        filteredLaptops = filteredLaptops.filter(laptop => laptop.brand === brand);
    }
    if (ram) {
        filteredLaptops = filteredLaptops.filter(laptop => laptop.ram == ram);
    }
    filteredLaptops = filteredLaptops.filter(laptop => laptop.price >= minPrice && laptop.price <= maxPrice);

    displayLaptops(filteredLaptops);
}

function populateFilters() {
    const brands = new Set(laptopsData.map(laptop => laptop.brand));
    const rams = new Set(laptopsData.map(laptop => laptop.ram));

    const brandFilter = document.getElementById("brandFilter");
    const ramFilter = document.getElementById("ramFilter");

    brandFilter.innerHTML = `<option value="">All Brands</option>`;
    brands.forEach(brand => {
        brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
    });

    ramFilter.innerHTML = `<option value="">All RAM</option>`;
    rams.forEach(ram => {
        ramFilter.innerHTML += `<option value="${ram}">${ram}GB</option>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    if (localStorage.getItem("token")) {
        document.getElementById("auth").style.display = "none";
        document.getElementById("laptop-section").style.display = "block";
        loadLaptops();
    }
});
