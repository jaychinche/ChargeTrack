<img width="1440" alt="Screenshot 2025-06-02 at 8 53 47 PM" src="https://github.com/user-attachments/assets/59f5d4f5-179b-4357-b3c1-bb52b0c8d731" /><img width="1440" alt="Screenshot 2025-06-02 at 8 54 41 PM" src="https://github.com/user-attachments/assets/14c1ba8e-25fa-4907-8fda-422f54253dbc" /># ⚡ ChargeTrack - EV Charging Station Manager

ChargeTrack is a full-stack web application built to manage and visualize Electric Vehicle (EV) charging stations. It enables user authentication, station onboarding with CRUD functionality, Google Maps integration for visualization, and full cloud deployment.

---

## 🚀 Live Demo
- 🔗 **Frontend (Vue.js)**: [https://chargetrack-frontend.vercel.app](https://charge-track.vercel.app)
- 🔗 **Backend API (Node.js + Express)**: [https://chargetrack-backend.onrender.com/api](https://chargetrack.onrender.com)
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
| Frontend  | Vue.js, Axios,OpenStreetMap|
| Backend   | Node.js, Express.js    |
| Database  | MongoDB with Mongoose  |
| Auth      | JWT, bcrypt.js         |
| Deployment| Vercel (Frontend), Render (Backend) |

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
- Integrated **OpenStreetMap ** 
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
MONGO_URI=your_mongo_db_url
NODE_ENV=development
PORT=9000
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30


# Run server
npm run dev
🖥️ Frontend Setup

cd frontend
npm install
Update the BASE_URL for Axios in your Vue config or service files:

// Example: axios.defaults.baseURL = 'https://chargetrack-backend.onrender.com/api';

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


Splash Screen 
<img width="1440" alt="Screenshot 2025-06-02 at 8 49 29 PM" src="https://github.com/user-attachments/assets/b97b8910-3aae-49f9-a3d3-763f85888062" />


Signin and Signup
<img width="1440" alt="Screenshot 2025-06-02 at 8 49 36 PM" src="https://github.com/user-attachments/assets/17c1f1c5-4f9c-4fcb-a68f-0f84286141fd" />

<img width="1440" alt="Screenshot 2025-06-02 at 8 49 43 PM" src="https://github.com/user-attachments/assets/9956cddb-999f-4981-9cdc-0ef2eb3b6b0f" />



Dashbaord of admin

<img width="1440" alt="Screenshot 2025-06-02 at 8 49 53 PM" src="https://github.com/user-attachments/assets/2c20772b-5cd2-4dce-a8da-2ca2c4a8e145" />


Edit the station

<img width="1440" alt="Screenshot 2025-06-02 at 8 51 59 PM" src="https://github.com/user-attachments/assets/b8413ce9-82f6-4a5f-b1ef-3df4e5bb90b8" />

Booking All list see by admin
<img width="1440" alt="Screenshot 2025-06-02 at 8 52 15 PM" src="https://github.com/user-attachments/assets/96bacd15-982e-4f9a-bde4-5a6d9921d252" />



Setting
<img width="1440" alt="Screenshot 2025-06-02 at 8 52 50 PM" src="https://github.com/user-attachments/assets/0ec8d974-6eac-4eaa-9881-9beee66ea8f3" />




Booking Magament
<img width="1440" alt="Screenshot 2025-06-02 at 8 52 15 PM" src="https://github.com/user-attachments/assets/4d4e67c2-db92-4e65-a7d2-350095e21ae1" />

Delete the booking station
<img width="1440" alt="Screenshot 2025-06-02 at 8 52 24 PM" src="https://github.com/user-attachments/assets/1115d152-a7c4-4e91-acd4-92f553bb1d8d" />





Dashboard of User 

<img width="1440" alt="Screenshot 2025-06-02 at 8 53 47 PM" src="https://github.com/user-attachments/assets/f0232492-afce-4815-87c4-10246222d55c" />

![Uploading Screenshot 2025-06-02 at 8.53.47 PM.png…]()

Find the Station By User

<img width="1440" alt="Screenshot 2025-06-02 at 8 53 56 PM" src="https://github.com/user-attachments/assets/9626533f-1a7f-4e7a-941b-cf4f97dfc22c" />

Find the station in Map
<img width="1440" alt="Screenshot 2025-06-02 at 8 54 31 PM" src="https://github.com/user-attachments/assets/3860bd11-7312-4b3c-957e-179cbe221c99" />

Booking the station by user
<img width="1440" alt="Screenshot 2025-06-02 at 8 54 08 PM" src="https://github.com/user-attachments/assets/4acd4373-e9e4-48e9-ad1e-9d558f45f27f" />



Page Not found!

[Uploading Screenshot 2025-06-02 at 8.54.41 PM.png…]()







