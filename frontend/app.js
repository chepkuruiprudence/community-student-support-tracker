const API = "http://127.0.0.1:8000/api";

/* ✅ AUTH HELPER */
window.authHeaders = function () {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
    };
};

/* ✅ STUDENT: LOAD MY NEEDS */
window.loadStudent = async function () {
    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;

    const needs = await res.json();
    const container = document.getElementById("needs");
    if (!container) return;

    container.innerHTML = needs.map(n => `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg text-slate-800">${n.title}</h3>
                <span class="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 uppercase">${n.status}</span>
            </div>
            <p class="text-slate-600 mb-4">${n.description || ""}</p>
            <div class="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                    <p class="text-slate-400">Required</p>
                    <p class="font-bold text-slate-800">$${n.amount_required}</p>
                </div>
                <div>
                    <p class="text-slate-400">Pledged</p>
                    <p class="font-bold text-green-600">$${n.amount_pledged}</p>
                </div>
            </div>
        </div>
    `).join("");
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
        location.reload();
    } else {
        alert("Error creating need");
    }
};

/* ✅ DONOR: LOAD DASHBOARD (WITH EXPENSES) */
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

        // Logic to show expenses
        const expensesHtml = n.expenses && n.expenses.length > 0 
            ? n.expenses.map(e => `
                <div class="flex justify-between text-xs bg-slate-50 p-2 rounded border-l-2 border-orange-400 mb-1">
                    <span>${e.description}</span>
                    <span class="font-bold">-$${e.amount_spent}</span>
                </div>`).join('')
            : `<p class="text-xs text-slate-400 italic">No expenses logged yet.</p>`;

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

/* ✅ AUTH: REGISTER & LOGIN */
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
            } else { alert("Login Failed"); }
        };
    }

    // Auto-Loader
    if (user?.is_student && document.getElementById("needs")) loadStudent();
    if (user?.is_donor && document.getElementById("donor-needs-container")) loadDonorDashboard();
});