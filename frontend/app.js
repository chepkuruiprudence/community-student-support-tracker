const API = "http://127.0.0.1:8000/api";

// Get elements
const usernameEl = document.getElementById("username");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const roleEl = document.getElementById("role");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

// --- REGISTER ---
registerBtn.onclick = async () => {
  const res = await fetch(`${API}/users/register/`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: usernameEl.value,
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

  alert("Registered! Now login.");
  window.location.href = "login.html";
};

// --- LOGIN ---
loginBtn.onclick = async () => {
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
  else alert("User role not set");
};

// --- PAGE REDIRECT if logged in ---
const user = JSON.parse(localStorage.getItem("user"));
if (user?.is_student) window.location.href = "student.html";
if (user?.is_donor) window.location.href = "donor.html";
