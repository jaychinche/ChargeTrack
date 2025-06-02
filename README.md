# ⚡ ChargeTrack - EV Charging Station Manager

ChargeTrack is a full-stack web application for managing and visualizing Electric Vehicle (EV) charging stations. It features user authentication, station management with CRUD operations, interactive maps, and cloud deployment.

## 🌟 Live Demo

| Component       | URL                                                                 |
|-----------------|---------------------------------------------------------------------|
| Frontend        | [https://chargetrack-frontend.vercel.app](https://charge-track.vercel.app) |
| Backend API     | [https://chargetrack-backend.onrender.com/api](https://chargetrack.onrender.com) |
| Postman Docs    | [View Collection](https://www.postman.com/your-workspace/collections/charge-track) |

## ✨ Key Features

### 🔐 Authentication System
- User registration and login flows
- JWT-based authentication
- Protected routes for admin functionality

### ⚡ Charging Station Management
- **CRUD Operations**:
  - Create new charging stations
  - Read station details
  - Update station information
  - Delete stations
- **Advanced Filtering**:
  - By status (Active/Inactive)
  - By power output level
  - By connector type

### 🗺️ Interactive Map Integration
- Visualize all stations on OpenStreetMap
- Marker clustering for dense areas
- Click markers for station details popup

### 👥 Role-Based Access
- **Admin Dashboard**:
  - Manage all stations
  - View all bookings
  - System configuration
- **User Dashboard**:
  - Find nearby stations
  - Make bookings
  - View booking history

## 🛠️ Technology Stack

### Frontend
- Vue.js 3 (Composition API)
- Vue Router for navigation
- Pinia for state management
- Axios for HTTP requests
- OpenStreetMap + Leaflet for mapping
- Tailwind CSS for styling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt.js for password hashing
- CORS middleware

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📡 API Endpoints

### Authentication
| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/auth/register`      | Register new user               |
| POST   | `/auth/login`         | Login user (returns JWT token)  |

### Charging Stations (Admin)
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| GET    | `/stations`          | Get all stations (paginated)   |
| POST   | `/stations`          | Create new station             |
| GET    | `/stations/:id`      | Get single station details     |
| PUT    | `/stations/:id`      | Update station                 |
| DELETE | `/stations/:id`      | Delete station                 |

### Bookings
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| GET    | `/bookings`          | Get all bookings (admin)       |
| POST   | `/bookings`          | Create new booking (user)      |
| DELETE | `/bookings/:id`      | Cancel booking                 |

## 🖼️ Application Screenshots

### Authentication
![Login Screen](https://github.com/user-attachments/assets/17c1f1c5-4f9c-4fcb-a68f-0f84286141fd)
![Registration Screen](https://github.com/user-attachments/assets/9956cddb-999f-4981-9cdc-0ef2eb3b6b0f)

### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/2c20772b-5cd2-4dce-a8da-2ca2c4a8e145)
![Station Management](https://github.com/user-attachments/assets/b8413ce9-82f6-4a5f-b1ef-3df4e5bb90b8)
![Booking Management](https://github.com/user-attachments/assets/96bacd15-982e-4f9a-bde4-5a6d9921d252)

### User Experience
![User Dashboard](https://github.com/user-attachments/assets/f0232492-afce-4815-87c4-10246222d55c)
![Station Finder](https://github.com/user-attachments/assets/9626533f-1a7f-4e7a-941b-cf4f97dfc22c)
![Map View](https://github.com/user-attachments/assets/3860bd11-7312-4b3c-957e-179cbe221c99)
![Booking Flow](https://github.com/user-attachments/assets/4acd4373-e9e4-48e9-ad1e-9d558f45f27f)

## 🚀 Installation Guide

### Backend Setup
1. Clone the repository
2. Navigate to backend directory:
  
   cd backend



   Install dependencies:

bash
npm install
Create environment file:

bash
touch .env
Configure .env:

env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chargeTrack
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d
PORT=9000
Start the server:

bash
npm run dev
Frontend Setup
Navigate to frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
Configure API base URL in src/config.js:

javascript
export const API_BASE_URL = 'https://chargetrack-backend.onrender.com/api';
Start development server:

bash
npm run dev
🌐 Deployment
Backend
Push to GitHub repository

Connect to Render.com

Set environment variables

Deploy!

Frontend
Push to GitHub repository

Connect to Vercel

Set build command: npm run build

Set output directory: dist

Deploy!

📝 License
This project is licensed under the MIT License - see the LICENSE.md file for details.

✉️ Contact
For questions or feedback, please contact:

Email: developer@example.com

GitHub: @yourusername

