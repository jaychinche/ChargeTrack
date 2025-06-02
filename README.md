# ⚡ ChargeTrack - EV Charging Station Manager

ChargeTrack is a full-stack web application built to manage and visualize Electric Vehicle (EV) charging stations. It enables user authentication, station onboarding with CRUD functionality, Google Maps integration for visualization, and full cloud deployment.

---

## 🚀 Live Demo

- 🔗 **Frontend (Vue.js)**: [https://chargetrack-frontend.vercel.app](https://chargetrack-frontend.vercel.app)
- 🔗 **Backend API (Node.js + Express)**: [https://chargetrack-backend.onrender.com/api](https://chargetrack-backend.onrender.com/api)
- 🔗 **Postman Collection**: [Click here to view/import](https://www.postman.com/your-workspace/collections/charge-track)

---

## 📌 Features

### ✅ Authentication
- User registration and login
- JWT-based authentication
- Protected routes for chargers management

### ✅ Charging Station Management
- Add new charging stations
- View all onboarded chargers
- Edit charging station details
- Delete charging stations
- Filter stations by:
  - Status (Active / Inactive)
  - Power Output
  - Connector Type

### ✅ Map View
- Visualize all stations on an interactive map (Google Maps or OpenStreetMap)
- Click markers to view station details

---

## 🧱 Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Frontend  | Vue.js, Axios, Google Maps JS API |
| Backend   | Node.js, Express.js    |
| Database  | MongoDB with Mongoose  |
| Auth      | JWT, bcrypt.js         |
| Deployment| Vercel (Frontend), Render (Backend) |

---

## 📁 Folder Structure

---

## 🧪 API Endpoints

### 🔐 Authentication
| Method | Endpoint              | Description             |
|--------|------------------------|-------------------------|
| POST   | `/api/auth/register`   | Register new user       |
| POST   | `/api/auth/login`      | Login user (returns JWT)|

### 🔌 Charging Stations (Protected)
| Method | Endpoint             | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/stations`       | Get all stations               |
| POST   | `/api/stations`       | Create a new station           |
| PUT    | `/api/stations/:id`   | Update a station by ID         |
| DELETE | `/api/stations/:id`   | Delete a station by ID         |

---

## 🗺️ Map Integration

- Integrated **Google Maps** via Google Maps JavaScript API.
- All chargers are shown as map markers.
- Clicking a marker displays charger name, status, power output, and connector type.

---

## ⚙️ Setup Instructions

### 📦 Backend Setup


cd backend
npm install
# Create a `.env` file
touch .env


📄 .env File Example
ini
Copy
Edit
PORT=5000
MONGODB_URI=your_mongo_db_url
JWT_SECRET=your_secret_key



# Run server
npm run dev


🖥️ Frontend Setup
bash
Copy
Edit
cd frontend
npm install
Update the BASE_URL for Axios in your Vue config or service files:

js
Copy
Edit
// Example: axios.defaults.baseURL = 'https://chargetrack-backend.onrender.com/api';
bash
Copy
Edit
# Run Vue app
npm run dev



☁️ Deployment
🌐 Backend
Deployed on Render

MongoDB hosted on MongoDB Atlas

🌐 Frontend
Deployed on Vercel

Ensure CORS is enabled in Express backend for frontend domain.

📦 Postman Collection
Test all APIs using the Postman Collection linked above.

Set JWT token as Authorization: Bearer <your-token> for protected routes.

📸 Screenshots (Optional)
_You can add screenshots of login page, list view, map view, and Postman

