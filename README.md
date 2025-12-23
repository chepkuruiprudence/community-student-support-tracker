# 🎓 EduSupport
**A Transparent Student Crowdfunding Platform**

EduSupport is a web application designed to bridge the gap between students in financial need and generous donors. Unlike traditional platforms, EduSupport emphasizes **transparency** by allowing students to log how they spend pledged funds, giving donors real-time insight into the impact of their contributions.

---

## 🚀 Features

### For Students
* **Create Needs:** Post support requests with specific financial goals.
* **Financial Dashboard:** A real-time overview of total pledged funds, total spent, and remaining balance.
* **Spending Logs (CRUD):** Log individual expenses against specific needs to maintain transparency.
* **Request Management:** Edit or delete needs and expense logs as circumstances change.

### For Donors
* **Discovery:** Browse a curated list of active student needs.
* **Impact Tracking:** View the detailed spending history of students you have supported.
* **One-Click Pledging:** Quickly contribute funds to specific requests.

---

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3 (Tailwind CSS), JavaScript (Vanilla ES6)
* **Backend:** Python, Django, Django REST Framework (DRF)
* **Database:** SQLite (Default) / PostgreSQL
* **Authentication:** Token-based Authentication

---

## 📡 API Documentation

### 🔐 Authentication
All private endpoints require the following header:
`Authorization: Token <your_token_here>`

### 🎒 Student Needs (`/api/needs/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/needs/` | List all needs (Students see theirs; Donors see all) |
| **POST** | `/api/needs/` | Create a new support request (Student only) |
| **GET** | `/api/needs/{id}/` | Retrieve details of a specific need |
| **PUT/PATCH** | `/api/needs/{id}/` | Update need title/description (Owner only) |
| **DELETE** | `/api/needs/{id}/` | Remove a support request |
| **POST** | `/api/needs/{id}/pledge/` | Pledge money to a need (Donor only) |

### 💸 Expenses (`/api/expenses/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/expenses/` | List all expense logs for the current student |
| **POST** | `/api/expenses/` | Log a new expenditure against a need |
| **DELETE** | `/api/expenses/{id}/` | Remove an expense log (Refunds the balance) |

### 👤 User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/users/register/` | Register a new Student or Donor account |
| **POST** | `/api/users/login/` | Exchange credentials for an Auth Token |

---

## 🏗 Business Logic & CRUD Operations

The application follows a strict CRUD (Create, Read, Update, Delete) cycle to ensure data integrity:

1.  **Needs:** Students **Create** requests. Donors **Read** them. Donors **Update** the `amount_pledged` via the pledge action. Students can **Delete** requests.
2.  **Expenses:** Students **Create** logs. Both roles **Read** logs. Students can **Delete** logs to correct errors, which dynamically updates the "Remaining Balance."



---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/chepkuruiprudence/edusupport.git](https://github.com/chepkuruiprudence/edusupport.git)


cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver