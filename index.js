let users = JSON.parse(localStorage.getItem("users")) || [];
let user = {};

// 🔹 Toggle Dark/Light Theme
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

// 🔹 Toggle Sidebar Menu
function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
}

// 🔹 Show Login Form
function showLogin() {
    toggleMenu();
    document.getElementById("root").innerHTML = `
        <h2>Login</h2>
        <div id="msg"></div>
        <input type="text" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <button onclick="chkUser()">Login</button>
        <p>Don't have an account? <button onclick="showForm()">Register</button></p>
    `;
}

// 🔹 Show Registration Form
function showForm() {
    toggleMenu();
    document.getElementById("root").innerHTML = `
        <h2>Create Account</h2>
        <input type="text" id="name" placeholder="Full Name">
        <input type="text" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <input type="date" id="dob">
        <button onclick="addUser()">Register</button>
        <p>Already have an account? <button onclick="showLogin()">Login</button></p>
    `;
}

// 🔹 Add User
function addUser() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let dob = document.getElementById("dob").value;

    if (!name || !email || !password || !dob) {
        alert("All fields are required.");
        return;
    }

    let newUser = { name, email, password, dob, balance: 0 };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    showLogin();
}

// 🔹 Check Login Credentials
function chkUser() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
        user = foundUser;
        home();
    } else {
        document.getElementById("msg").innerHTML = `<p style="color: red;">Invalid credentials.</p>`;
    }
}

// 🔹 Show Dashboard (Transactions & User Info)
function home() {
    document.getElementById("root").innerHTML = `
        <h2>Welcome, ${user.name}!</h2>
        <p><b>Balance: $<span id="spBalance">${user.balance}</span></b></p>
        
        <select id="type" onchange="showUser()">
            <option value="0">--Select--</option>
            <option value="1">Deposit</option>
            <option value="2">Withdraw</option>
            <option value="3">Transfer</option>
        </select>

        <p><select id="selUser" style="display:none"></select></p>
        <p><input type="number" id="amount" placeholder="Enter Amount"></p>
        <button onclick="saveData()">Submit</button>

        <p><button onclick="showLogin()">Logout</button></p>
    `;
}

// 🔹 Show Users for Transfers
function showUser() {
    let selUser = document.getElementById("selUser");
    let type = document.getElementById("type").value;

    if (type == "3") {
        selUser.style.display = 'block';
        let options = "<option value='0'>--Select--</option>";
        users.forEach(u => {
            if (u.email !== user.email) {
                options += `<option value='${u.email}'>${u.name}</option>`;
            }
        });
        selUser.innerHTML = options;
    } else {
        selUser.style.display = "none";
    }
}

// 🔹 Handle Transactions (Deposit, Withdraw, Transfer)
function saveData() {
    let amount = Number(document.getElementById("amount").value);
    let type = document.getElementById("type").value;

    if (amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    if (type == "1") { // Deposit
        user.balance += amount;
    } 
    else if (type == "2") { // Withdraw
        if (user.balance >= amount) {
            user.balance -= amount;
        } else {
            alert("Insufficient balance");
            return;
        }
    } 
    else if (type == "3") { // Transfer
        let receiverEmail = document.getElementById("selUser").value;
        
        if (!receiverEmail || receiverEmail == "0") {
            alert("Select a valid recipient.");
            return;
        }

        let receiver = users.find(u => u.email === receiverEmail);

        if (receiver && user.balance >= amount) {
            user.balance -= amount;
            receiver.balance += amount;
            localStorage.setItem("users", JSON.stringify(users));
            alert(`$${amount} successfully transferred to ${receiver.name}.`);
        } else {
            alert("Insufficient balance or recipient not found.");
            return;
        }
    }

    document.getElementById("spBalance").innerText = user.balance;
    let userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem("users", JSON.stringify(users));
    }
}

// 🔹 Clear Local Storage & Reset
function clearLocalStorage() {
    localStorage.clear();
    alert("Local storage cleared!");
    location.reload();
}

// 🔹 Initialize App
showLogin();