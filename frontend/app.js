const API = "http://127.0.0.1:8000/api";

/* ✅ AUTH HELPER */
window.authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Token ${localStorage.getItem("token")}`
});

/* ✅ STUDENT: LOAD NEEDS WITH SPENDING LOGS, SUMMARY & EMPTY STATE */
window.loadStudent = async function () {
    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;

    const needs = await res.json();
    const container = document.getElementById("needs");
    const summaryContainer = document.getElementById("spending-summary");
    if (!container) return;

    // --- 1. CALCULATE TOTALS FOR SUMMARY ---
    let grandTotalPledged = 0;
    let grandTotalSpent = 0;

    needs.forEach(n => {
        grandTotalPledged += parseFloat(n.amount_pledged || 0);
        const spentOnThisNeed = n.expenses ? n.expenses.reduce((sum, e) => sum + parseFloat(e.amount_spent), 0) : 0;
        grandTotalSpent += spentOnThisNeed;
    });

    if (summaryContainer) {
        summaryContainer.innerHTML = `
        <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Financial Overview</p>
            <div class="flex flex-wrap gap-8 items-end">
                <div>
                    <p class="text-3xl font-bold text-white">$${grandTotalSpent.toFixed(2)}</p>
                    <p class="text-slate-400 text-[10px] uppercase font-bold">Total Spent</p>
                </div>
                <div class="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
                <div>
                    <p class="text-3xl font-bold text-green-400">$${(grandTotalPledged - grandTotalSpent).toFixed(2)}</p>
                    <p class="text-slate-400 text-[10px] uppercase font-bold">Remaining Balance</p>
                </div>
                <div class="ml-auto text-right">
                    <p class="text-slate-400 text-[10px] uppercase font-bold">Total Support Received</p>
                    <p class="text-xl font-bold text-blue-400">$${grandTotalPledged.toFixed(2)}</p>
                </div>
            </div>
        </div>`;
    }

    // --- 2. RENDER EMPTY STATE IF NO NEEDS ---
    if (needs.length === 0) {
        container.classList.remove('grid', 'md:grid-cols-2'); 
        container.innerHTML = `
            <div class="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 w-full">
                <div class="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800">No active needs yet</h3>
                <p class="text-slate-500 text-sm max-w-xs mx-auto">Create your first support request using the form above to start receiving help from donors.</p>
            </div>`;
        return;
    }

    // Re-add grid layout if items exist
    container.classList.add('grid', 'md:grid-cols-2');

    // --- 3. RENDER INDIVIDUAL CARDS ---
    container.innerHTML = needs.map(n => {
        const totalSpent = n.expenses ? n.expenses.reduce((sum, e) => sum + parseFloat(e.amount_spent), 0) : 0;
        const remainingBalance = (parseFloat(n.amount_pledged) - totalSpent).toFixed(2);

        const historyHtml = n.expenses && n.expenses.length > 0 
            ? n.expenses.map(e => `
                <div class="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded border-l-2 border-blue-400 mb-1">
                    <span class="text-slate-600">${e.description}</span>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800">-$${parseFloat(e.amount_spent).toFixed(2)}</span>
                        <button onclick="deleteExpense(${e.id})" class="text-red-400 hover:text-red-600 transition">✕</button>
                    </div>
                </div>`).join('')
            : `<p class="text-[10px] text-slate-400 italic">No logs yet.</p>`;

        return `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 group relative">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg text-slate-800">${n.title}</h3>
                    <span class="px-2 py-1 text-[9px] font-bold rounded bg-blue-100 text-blue-700 uppercase">${n.status}</span>
                </div>
                <button onclick="deleteNeed(${n.id})" class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 mt-2">
                <div><p class="text-slate-400 font-bold uppercase">Pledged</p><p class="font-bold text-green-600">$${n.amount_pledged}</p></div>
                <div><p class="text-slate-400 font-bold uppercase">Spent</p><p class="font-bold text-orange-600">$${totalSpent.toFixed(2)}</p></div>
                <div><p class="text-slate-400 font-bold uppercase">Balance</p><p class="font-bold text-blue-600">$${remainingBalance}</p></div>
            </div>

            <div class="mb-4">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Spending History</p>
                <div class="max-h-24 overflow-y-auto">${historyHtml}</div>
            </div>

            <div class="border-t pt-4">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Log New Expense</p>
                <div class="flex flex-col gap-2">
                    <input type="text" id="exDesc${n.id}" placeholder="What was bought?" class="border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                    <div class="flex gap-2">
                        <input type="number" id="exAmt${n.id}" placeholder="Amount" class="border rounded px-2 py-1 text-sm w-full outline-none focus:ring-1 focus:ring-blue-500">
                        <button onclick="logExpense(${n.id}, ${remainingBalance})" class="bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-black transition">Log</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join("");
};

/* ✅ STUDENT: ACTIONS (CREATE / DELETE / LOG) */
window.createNeed = async function () {
    const title = document.getElementById("newNeedTitle").value;
    const amount_required = document.getElementById("newNeedAmount").value;
    const description = document.getElementById("newNeedDesc").value;

    if (!title || !amount_required) return alert("Please fill title and amount");

    const res = await fetch(`${API}/needs/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, amount_required: parseFloat(amount_required), description })
    });

    if (res.ok) {
        alert("Need created!");
        loadStudent();
        document.getElementById("newNeedTitle").value = "";
        document.getElementById("newNeedAmount").value = "";
        document.getElementById("newNeedDesc").value = "";
    } else { alert("Error creating need"); }
};

window.deleteNeed = async function (id) {
    if (!confirm("Are you sure? This will remove the need and all related expense logs.")) return;
    const res = await fetch(`${API}/needs/${id}/`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) loadStudent();
};

window.logExpense = async function (needId, balance) {
    const descInput = document.getElementById(`exDesc${needId}`);
    const amtInput = document.getElementById(`exAmt${needId}`);
    const description = descInput.value;
    const amount = amtInput.value;

    if (!description || !amount) return alert("Fill in both fields");
    if (parseFloat(amount) > parseFloat(balance)) return alert("Error: Insufficient balance!");

    const res = await fetch(`${API}/expenses/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ need: parseInt(needId), description, amount_spent: parseFloat(amount) })
    });

    if (res.ok) { await loadStudent(); } 
    else { alert("Failed to log expense"); }
};

window.deleteExpense = async function (id) {
    if (!confirm("Delete this expense log?")) return;
    const res = await fetch(`${API}/expenses/${id}/`, { method: "DELETE", headers: authHeaders() });
    if (res.ok) loadStudent();
};

/* ✅ DONOR DASHBOARD & PLEDGE LOGIC */
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
            ? n.expenses.map(e => `<div class="flex justify-between text-xs bg-slate-50 p-2 rounded border-l-2 border-orange-400 mb-1"><span>${e.description}</span><span class="font-bold">-$${e.amount_spent}</span></div>`).join('')
            : `<p class="text-xs text-slate-400 italic text-center">No spending recorded yet.</p>`;

        return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div class="p-5">
                <h3 class="font-bold text-slate-800 mb-1">${n.title}</h3>
                <p class="text-slate-500 text-sm mb-4">${n.description}</p>
                <div class="mb-4">
                    <div class="flex justify-between text-xs mb-1 font-bold"><span>$${pledged} raised</span><span class="text-slate-400">Goal: $${required}</span></div>
                    <div class="w-full bg-slate-100 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width: ${progress}%"></div></div>
                </div>
                <div class="mt-4 pt-4 border-t"><p class="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">Student Spending History</p>${expensesHtml}</div>
            </div>
            <div class="p-4 bg-slate-50 border-t mt-auto">
                ${n.status !== 'funded' ? `<div class="flex gap-2"><input type="number" id="p${n.id}" placeholder="Amount" class="border rounded-lg px-3 py-2 w-full text-sm"><button onclick="pledgeMoney(${n.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Pledge</button></div>` : `<div class="text-center text-green-600 font-bold text-sm">Fully Funded 🎉</div>`}
            </div>
        </div>`;
    }).join("");
};

window.pledgeMoney = async function (needId) {
    const amount = document.getElementById(`p${needId}`).value;
    if (!amount) return alert("Enter an amount");
    const res = await fetch(`${API}/needs/${needId}/pledge/`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ amount: parseFloat(amount) })
    });
    if (res.ok) { alert("Thank you!"); loadDonorDashboard(); }
};

/* ✅ DOM CONTENT LOADED INITIALIZATION */
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.is_student && document.getElementById("needs")) loadStudent();
    if (user?.is_donor && document.getElementById("donor-needs-container")) loadDonorDashboard();
});