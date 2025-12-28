// navbar.js
const navbarContainer = document.getElementById("navbar-container");
const user = JSON.parse(localStorage.getItem("user"));
const currentPath = window.location.pathname;

/* 🔒 SECURITY GUARD */
const isStudentPage = currentPath.includes("student.html");
const isDonorPage = currentPath.includes("donor.html");

if (!user && (isStudentPage || isDonorPage)) {
    window.location.href = "login.html";
}
if (user) {
    if (isDonorPage && !user.is_donor) window.location.href = "student.html";
    if (isStudentPage && !user.is_student) window.location.href = "donor.html";
}

/* 🏠 NAVBAR RENDERING */
if (navbarContainer) {
    const homeLink = `<a href="index.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Home</a>`;

    if (user) {
        let dashboardLink = user.is_student 
            ? `<a href="student.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Student Dashboard</a>`
            : `<a href="donor.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Donor Dashboard</a>`;

        navbarContainer.innerHTML = `
            <nav class="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 w-full z-50">
                <div class="flex items-center space-x-4">
                    <div class="text-xl font-bold text-blue-600">EduSupport</div>
                    <span class="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">
                        ${user.is_student ? 'Student' : 'Donor'}: ${user.username}
                    </span>
                </div>
                <div class="space-x-6 flex items-center">
                    ${homeLink}
                    ${dashboardLink}
                    <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">Logout</button>
                </div>
            </nav>
            <div class="h-20"></div>`;

        document.getElementById("logoutBtn").onclick = () => {
            localStorage.clear();
            window.location.href = "login.html"; // ✅ Changed to login.html
        };
    } else {
        navbarContainer.innerHTML = `
            <nav class="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 w-full z-50">
                <div class="text-xl font-bold text-blue-600">EduSupport</div>
                <div class="space-x-6 flex items-center">
                    ${homeLink}
                    <a href="login.html" class="text-gray-700 hover:text-blue-600 transition duration-200 font-medium">Login</a>
                    <a href="register.html" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100">Register</a>
                </div>
            </nav>
            <div class="h-20"></div>`;
    }
}