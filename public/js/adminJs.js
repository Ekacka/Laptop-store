async function checkAuth() {
    let response = await fetch("/api/admin/check-auth");
    if (response.status !== 200) {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("admin-container").style.display = "none";
    } else {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("admin-container").style.display = "block";
        loadLaptops();
        fetchBestSelling();
    }
}

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (response.status === 200) {
        checkAuth();
    } else {
        alert("Invalid login credentials");
    }
}

async function logout() {
    await fetch("/api/admin/logout");
    checkAuth();
}

async function loadLaptops() {
    let response = await fetch("/api/admin/laptops");
    let laptops = await response.json();
    let table = document.getElementById("laptops");
    table.innerHTML = "<tr><th>Brand</th><th>Model</th><th>Price</th><th>Processor</th><th>RAM</th><th>Storage</th><th>Graphics</th><th>Availability</th><th>Actions</th></tr>";
    laptops.forEach(laptop => {
        table.innerHTML += `
            <tr>
                <td>${laptop.brand}</td>
                <td>${laptop.model}</td>
                <td>${laptop.price}</td>
                <td>${laptop.processor}</td>
                <td>${laptop.ram}</td>
                <td>${laptop.storage}</td>
                <td>${laptop.graphics}</td>
                <td>${laptop.availability ? "✅" : "❌"}</td>
                <td>
                    <button onclick="updateLaptop('${laptop._id}')">Update</button>
                    <button onclick="deleteLaptop('${laptop._id}')">Delete</button>
                </td>
            </tr>`;
    });
}

async function addLaptop() {
    let laptop = {
        brand: document.getElementById("brand").value,
        model: document.getElementById("model").value,
        price: document.getElementById("price").value,
        processor: document.getElementById("processor").value,
        ram: document.getElementById("ram").value,
        storage: document.getElementById("storage").value,
        graphics: document.getElementById("graphics").value,
        availability: document.getElementById("availability").checked
    };
    await fetch("/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(laptop)
    });
    loadLaptops();
}

async function deleteLaptop(id) {
    await fetch(`/api/admin/delete/${id}`, { method: "POST" });
    loadLaptops();
}

async function updateLaptop(id) {
    let updatedLaptop = {
        brand: prompt("Enter new brand:"),
        model: prompt("Enter new model:"),
        price: prompt("Enter new price:"),
        processor: prompt("Enter new processor:"),
        ram: prompt("Enter new RAM:"),
        storage: prompt("Enter new storage:"),
        graphics: prompt("Enter new graphics:"),
        availability: confirm("Is the laptop available?")
    };
    if (updatedLaptop.brand && updatedLaptop.model) {
        await fetch(`/api/admin/update/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedLaptop)
        });
        loadLaptops();
    }
}

async function fetchBestSelling() {
    try {
        const response = await fetch("/api/admin/best-selling");
        const data = await response.json();

        const labels = data.map(item => item.laptop);
        const values = data.map(item => item.totalSold);

        const ctx = document.getElementById("bestSellingChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Units Sold",
                    data: values,
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching best-selling laptops:", error);
    }
}

window.onload = checkAuth;
