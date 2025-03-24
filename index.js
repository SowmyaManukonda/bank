// Initialize users array from localStorage or empty array
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute
    showLogin();
});

// Update current date and time in footer
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDateTime').textContent = now.toLocaleString();
}

// 🔹 Theme Management
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    toggleMenu(); // Close menu after selection
}

// 🔹 Sidebar Management
function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("open");
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.querySelector(".hamburger");
    
    if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
        sidebar.classList.remove("open");
    }
});

// 🔹 Authentication Functions
function showLogin() {
    toggleMenu();
    document.getElementById("root").innerHTML = `
        <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
        <div id="message" class="message"></div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required>
            <small><a href="#" onclick="showPasswordReset()">Forgot password?</a></small>
        </div>
        <button onclick="loginUser()">Login</button>
        <p class="text-center">Don't have an account? <button class="secondary" onclick="showForm()">Register</button></p>
    `;
}

function showForm() {
    toggleMenu();
    document.getElementById("root").innerHTML = `
        <h2><i class="fas fa-user-plus"></i> Create Account</h2>
        <div id="message" class="message"></div>
        <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required>
            <small>Minimum 6 characters</small>
        </div>
        <div class="form-group">
            <label for="dob">Date of Birth</label>
            <input type="date" id="dob" required>
        </div>
        <button onclick="registerUser()">Register</button>
        <p class="text-center">Already have an account? <button class="secondary" onclick="showLogin()">Login</button></p>
    `;
}

function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const dob = document.getElementById("dob").value;
    
    // Basic validation
    if (!name || !email || !password || !dob) {
        showMessage("All fields are required.", "error");
        return;
    }
    
    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.", "error");
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        showMessage("An account with this email already exists.", "error");
        return;
    }
    
    // Create new user (in a real app, you would hash the password)
    const newUser = { 
        id: generateId(),
        name, 
        email, 
        password, 
        dob, 
        balance: 1000, // Starting balance
        transactions: [
            {
                id: generateId(),
                type: "deposit",
                amount: 1000,
                date: new Date().toISOString(),
                description: "Initial deposit"
            }
        ]
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    showMessage("Account created successfully! Please login.", "success");
    setTimeout(showLogin, 1500);
}

function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    const user = users.find(user => user.email === email && user.password === password);
    
    if (user) {
        currentUser = user;
        showDashboard();
    } else {
        showMessage("Invalid email or password.", "error");
    }
}

function logoutUser() {
    currentUser = null;
    showLogin();
}

// 🔹 Dashboard Functions
function showDashboard() {
    document.getElementById("root").innerHTML = `
        <div class="dashboard-header">
            <h2>Welcome, ${currentUser.name}!</h2>
            <p>Account: ${currentUser.email}</p>
        </div>
        
        <div class="balance">
            <small>Your Balance</small>
            <div>$${currentUser.balance.toFixed(2)}</div>
        </div>
        
        <div class="form-group">
            <label for="transactionType">Transaction Type</label>
            <select id="transactionType" onchange="updateTransactionForm()">
                <option value="">-- Select Transaction --</option>
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
                <option value="transfer">Transfer</option>
            </select>
        </div>
        
        <div id="transactionForm"></div>
        
        <div class="quick-actions">
            <button class="secondary" onclick="showTransactions()">
                <i class="fas fa-history"></i> View Transactions
            </button>
            <button class="danger" onclick="logoutUser()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}

function updateTransactionForm() {
    const type = document.getElementById("transactionType").value;
    let formHTML = "";
    
    switch(type) {
        case "deposit":
            formHTML = `
                <div class="form-group">
                    <label for="amount">Amount to Deposit</label>
                    <input type="number" id="amount" min="1" step="0.01" placeholder="Enter amount">
                </div>
                <button onclick="processTransaction('deposit')">Deposit</button>
            `;
            break;
            
        case "withdraw":
            formHTML = `
                <div class="form-group">
                    <label for="amount">Amount to Withdraw</label>
                    <input type="number" id="amount" min="1" max="${currentUser.balance}" step="0.01" placeholder="Enter amount">
                </div>
                <button onclick="processTransaction('withdraw')">Withdraw</button>
            `;
            break;
            
        case "transfer":
            const otherUsers = users.filter(user => user.id !== currentUser.id);
            formHTML = `
                <div class="form-group">
                    <label for="recipient">Recipient</label>
                    <select id="recipient">
                        <option value="">-- Select Recipient --</option>
                        ${otherUsers.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="amount">Amount to Transfer</label>
                    <input type="number" id="amount" min="1" max="${currentUser.balance}" step="0.01" placeholder="Enter amount">
                </div>
                <button onclick="processTransaction('transfer')">Transfer</button>
            `;
            break;
            
        default:
            formHTML = "";
    }
    
    document.getElementById("transactionForm").innerHTML = formHTML;
}

function processTransaction(type) {
    const amountInput = document.getElementById("amount");
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        showMessage("Please enter a valid amount.", "error");
        return;
    }
    
    let recipient = null;
    
    if (type === "transfer") {
        const recipientId = document.getElementById("recipient").value;
        recipient = users.find(user => user.id === recipientId);
        
        if (!recipient) {
            showMessage("Please select a valid recipient.", "error");
            return;
        }
    }
    
    // Process transaction
    try {
        if (type === "withdraw" || type === "transfer") {
            if (amount > currentUser.balance) {
                showMessage("Insufficient funds.", "error");
                return;
            }
            currentUser.balance -= amount;
        }
        
        if (type === "deposit") {
            currentUser.balance += amount;
        }
        
        if (type === "transfer") {
            recipient.balance += amount;
        }
        
        // Record transaction
        const transaction = {
            id: generateId(),
            type,
            amount,
            date: new Date().toISOString(),
            newBalance: currentUser.balance,
            description: type === "transfer" ? `Transfer to ${recipient.name}` : type
        };
        
        currentUser.transactions.unshift(transaction);
        
        if (type === "transfer") {
            recipient.transactions.unshift({
                id: generateId(),
                type: "deposit",
                amount,
                date: new Date().toISOString(),
                newBalance: recipient.balance,
                description: `Transfer from ${currentUser.name}`
            });
        }
        
        // Update localStorage
        localStorage.setItem("users", JSON.stringify(users));
        
        // Show success message
        let message = `$${amount.toFixed(2)} ${type} successful.`;
        if (type === "transfer") {
            message += ` Transferred to ${recipient.name}.`;
        }
        
        showMessage(message, "success");
        showDashboard();
        
    } catch (error) {
        console.error("Transaction error:", error);
        showMessage("An error occurred during the transaction.", "error");
    }
}

// 🔹 Transaction History
function showTransactions() {
    toggleMenu();
    
    if (!currentUser) {
        showLogin();
        return;
    }
    
    document.getElementById("root").innerHTML = `
        <h2><i class="fas fa-history"></i> Transaction History</h2>
        <button class="secondary" onclick="showDashboard()"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
        
        <div class="transaction-list">
            ${currentUser.transactions.length > 0 
                ? currentUser.transactions.map(transaction => `
                    <div class="transaction-item">
                        <div>
                            <div class="transaction-description">${transaction.description}</div>
                            <div class="transaction-date">${new Date(transaction.date).toLocaleString()}</div>
                        </div>
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                        </div>
                    </div>
                `).join('')
                : '<p>No transactions found.</p>'
            }
        </div>
    `;
}

// 🔹 Utility Functions
function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    if (!messageDiv) return;
    
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => messageDiv.innerHTML = "", 3000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function clearLocalStorage() {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        localStorage.clear();
        users = [];
        currentUser = null;
        showLogin();
        showMessage("All data has been cleared.", "success");
    }
}

// Password reset placeholder
function showPasswordReset() {
    showMessage("Password reset functionality would be implemented here.", "info");
}