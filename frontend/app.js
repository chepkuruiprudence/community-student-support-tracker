const API = "http://127.0.0.1:8000/api";

/* ✅ AUTH HELPER */
window.authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Token ${localStorage.getItem("token")}`
});

/* ✅ STUDENT: LOAD NEEDS WITH SPENDING LOGS */
window.loadStudent = async function () {
    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;

    const needs = await res.json();
    const container = document.getElementById("needs");
    if (!container) return;

    container.innerHTML = needs.map(n => {
        // Calculate Total Spent and Balance
        const totalSpent = n.expenses ? n.expenses.reduce((sum, e) => sum + parseFloat(e.amount_spent), 0) : 0;
        const remainingBalance = (parseFloat(n.amount_pledged) - totalSpent).toFixed(2);

        return `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg text-slate-800">${n.title}</h3>
                <span class="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 uppercase">${n.status}</span>
            </div>
            <p class="text-slate-600 mb-4">${n.description || ""}</p>
            
            <div class="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <div>
                    <p class="text-slate-400 font-bold uppercase">Goal</p>
                    <p class="font-bold text-slate-800">$${n.amount_required}</p>
                </div>
                <div>
                    <p class="text-slate-400 font-bold uppercase">Pledged</p>
                    <p class="font-bold text-green-600">$${n.amount_pledged}</p>
                </div>
                <div>
                    <p class="text-slate-400 font-bold uppercase">Balance</p>
                    <p class="font-bold text-blue-600">$${remainingBalance}</p>
                </div>
            </div>

            <div class="border-t pt-4">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Log New Expense</p>
                <div class="flex flex-col gap-2">
                    <input type="text" id="exDesc${n.id}" placeholder="What was bought?" class="border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                    <div class="flex gap-2">
                        <input type="number" id="exAmt${n.id}" placeholder="Amount" class="border rounded px-2 py-1 text-sm w-full focus:ring-1 focus:ring-blue-500 outline-none">
                        <button onclick="logExpense(${n.id}, ${remainingBalance})" class="bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-black transition">Log</button>
                    </div>
                </div>
            </div>
        </div>
    `}).join("");
};

/* ✅ STUDENT: CREATE NEED */
window.createNeed = async function () {
    const title = document.getElementById("newNeedTitle").value;
    const amount_required = document.getElementById("newNeedAmount").value;
    const description = document.getElementById("newNeedDesc").value;

    if (!title || !amount_required) return alert("Please fill title and amount");

    const res = await fetch(`${API}/needs/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ 
            title, 
            amount_required: parseFloat(amount_required), 
            description 
        })
    });

    if (res.ok) {
        alert("Need created!");
        loadStudent(); // Refresh list without full reload
        document.getElementById("newNeedTitle").value = "";
        document.getElementById("newNeedAmount").value = "";
        document.getElementById("newNeedDesc").value = "";
    } else {
        alert("Error creating need");
    }
};

/* ✅ STUDENT: LOG EXPENSE ACTION */
window.logExpense = async function (needId, balance) {
    const description = document.getElementById(`exDesc${needId}`).value;
    const amount = document.getElementById(`exAmt${needId}`).value;

    if (!description || !amount) return alert("Fill in both fields");
    if (parseFloat(amount) > balance) return alert("Error: You cannot spend more than the current pledged balance!");

    const res = await fetch(`${API}/expenses/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            need: parseInt(needId),
            description: description,
            amount_spent: parseFloat(amount)
        })
    });

    if (res.ok) {
        alert("Expense recorded!");
        loadStudent();
    } else {
        alert("Failed to log expense.");
    }
};

/* ✅ DONOR: LOAD DASHBOARD (WITH SPENDING HISTORY) */
window.loadDonorDashboard = async function () {
    const container = document.getElementById("donor-needs-container");
    if (!container) return;

    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;
    const needs = await res.json();

    container.innerHTML = needs.map(n => {
        const pledged = parseFloat(n.amount_pledged) || 0;
        const required = parseFloat(n.amount_required) || 1;
        const progress = Math.min((pledged / required) * 100, 100).toFixed(0);

        const expensesHtml = n.expenses && n.expenses.length > 0 
            ? n.expenses.map(e => `
                <div class="flex justify-between text-xs bg-slate-50 p-2 rounded border-l-2 border-orange-400 mb-1">
                    <span>${e.description}</span>
                    <span class="font-bold">-$${e.amount_spent}</span>
                </div>`).join('')
            : `<p class="text-xs text-slate-400 italic text-center">No spending recorded yet.</p>`;

        return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div class="p-5">
                <h3 class="font-bold text-slate-800 mb-1">${n.title}</h3>
                <p class="text-slate-500 text-sm mb-4">${n.description}</p>
                
                <div class="mb-4">
                    <div class="flex justify-between text-xs mb-1 font-bold">
                        <span>$${pledged} raised</span>
                        <span class="text-slate-400">Goal: $${required}</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Student Spending History</p>
                    ${expensesHtml}
                </div>
            </div>

            <div class="p-4 bg-slate-50 border-t mt-auto">
                ${n.status !== 'funded' ? `
                    <div class="flex gap-2">
                        <input type="number" id="p${n.id}" placeholder="Amount" class="border rounded-lg px-3 py-2 w-full text-sm">
                        <button onclick="pledgeMoney(${n.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Pledge</button>
                    </div>
                ` : `<div class="text-center text-green-600 font-bold text-sm">Fully Funded 🎉</div>`}
            </div>
        </div>`;
    }).join("");
};

/* ✅ DONOR: PLEDGE MONEY */
window.pledgeMoney = async function (needId) {
    const amount = document.getElementById(`p${needId}`).value;
    if (!amount) return alert("Enter an amount");

    const res = await fetch(`${API}/needs/${needId}/pledge/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ amount: parseFloat(amount) })
    });

    if (res.ok) {
        alert("Thank you!");
        loadDonorDashboard();
    } else {
        alert("Pledge failed");
    }
};

/* ✅ AUTH & DOM CONTENT LOADED */
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Register Logic
    const regBtn = document.getElementById("registerBtn");
    if (regBtn) {
        regBtn.onclick = async () => {
            const res = await fetch(`${API}/users/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: document.getElementById("username").value,
                    email: document.getElementById("email").value,
                    password: document.getElementById("password").value,
                    is_student: document.getElementById("role").value === "student",
                    is_donor: document.getElementById("role").value === "donor"
                })
            });
            if (res.ok) { alert("Registered!"); location.href = "login.html"; }
            else { alert("Registration failed. Try a different username."); }
        };
    }

    // Login Logic
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.onclick = async () => {
            const res = await fetch(`${API}/users/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data));
                location.href = data.is_student ? "student.html" : "donor.html";
            } else { alert("Login Failed: Check your username or password."); }
        };
    }

    // Auto-Loader based on Page & Role
    if (user?.is_student && document.getElementById("needs")) loadStudent();
    if (user?.is_donor && document.getElementById("donor-needs-container")) loadDonorDashboard();
});