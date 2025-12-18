const API = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const emailEl = document.getElementById("email");
  const roleEl = document.getElementById("role");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  const user = JSON.parse(localStorage.getItem("user"));

  /* AUTH HEADER */
  function authHeaders() {
    return {
      "Authorization": `Token ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    };
  }

  /* REGISTER */
  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      console.log("REGISTER CLICKED");

      const res = await fetch(`${API}/users/register/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          username: usernameEl.value,
          email: emailEl.value,
          password: passwordEl.value,
          is_student: roleEl.value === "student",
          is_donor: roleEl.value === "donor"
        })
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        alert("Registration failed: " + JSON.stringify(data));
        return;
      }

      alert("Registered successfully! Redirecting to login...");
      window.location.href = "index.html"; // Redirect to login
    });
  }

  /* LOGIN */
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      console.log("LOGIN CLICKED");

      const res = await fetch(`${API}/users/login/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          username: usernameEl.value,
          password: passwordEl.value
        })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert("Login failed: " + JSON.stringify(data));
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      if (data.is_student) window.location.href = "student.html";
      else if (data.is_donor) window.location.href = "donor.html";
      else alert("User role missing");
    });
  }

  /* PAGE REDIRECT if already logged in */
  if (user) {
    if (user.is_student && window.location.pathname.includes("index.html")) {
      window.location.href = "student.html";
    } else if (user.is_donor && window.location.pathname.includes("index.html")) {
      window.location.href = "donor.html";
    }
  }

  /* LOAD STUDENT NEEDS */
  async function loadStudent() {
    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;
    const needs = await res.json();

    const container = document.getElementById("needs");
    if (!container) return;

    container.innerHTML = needs.map(n => `
      <div class="bg-white p-4 rounded shadow mb-4">
        <h3 class="font-bold">${n.title}</h3>
        <p>Pledged: ${n.amount_pledged} / Required: ${n.amount_required}</p>
        <p>${n.pledges?.length > 0 ? `Pledges: ${n.pledges.map(p => p.amount).join(", ")}` : "No pledges yet"}</p>
      </div>
    `).join("");
  }

  /* LOAD DONOR NEEDS */
  async function loadDonor() {
    const res = await fetch(`${API}/needs/`, { headers: authHeaders() });
    if (!res.ok) return;
    const needs = await res.json();

    const container = document.getElementById("needs");
    if (!container) return;

    container.innerHTML = needs.map(n => `
      <div class="bg-white p-4 rounded shadow mb-4">
        <h3 class="font-bold">${n.title}</h3>
        <p>Pledged: ${n.amount_pledged} / Required: ${n.amount_required}</p>
        <input id="p${n.id}" class="border p-1 w-full mt-2" placeholder="Enter pledge amount">
        <button onclick="pledge(${n.id})" class="bg-green-600 text-white w-full mt-2 p-2 rounded">
          Pledge
        </button>
      </div>
    `).join("");
  }

  /* PLEDGE FUNCTION */
  window.pledge = async function(id) {
    const amount = document.getElementById(`p${id}`).value;
    if (!amount) return alert("Enter an amount");

    const res = await fetch(`${API}/needs/${id}/pledge/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount })
    });

    if (!res.ok) return alert("Failed to pledge");
    alert("Pledged successfully!");
    loadDonor();
  };

  /* AUTO LOAD DASHBOARDS */
  if (user?.is_student && document.getElementById("needs")) loadStudent();
  if (user?.is_donor && document.getElementById("needs")) loadDonor();

});
