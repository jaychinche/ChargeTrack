<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo-container">
        <h1>ChargeTrack</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/user-dashboard" class="nav-item" active-class="active">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/user-dashboard/find-stations" class="nav-item" active-class="active">
          <i class="fas fa-map-marker-alt"></i>
          <span>Find Stations</span>
        </router-link>
        <router-link to="/user-dashboard/settings" class="nav-item" active-class="active">
          <i class="fas fa-cog"></i>
          <span>Settings</span>
        </router-link>
      </nav>
      
      <div class="user-profile">
        <div class="profile-info">
          <img :src="user.avatar || 'https://ui-avatars.com/api/?name='+user.username" alt="User" class="profile-img">
          <div>
            <p class="username">{{ user.username }}</p>
            <p class="role">Member</p>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="header">
        <h2>Welcome back, {{ user.username }}!</h2>
        <div class="header-actions">
          <button class="btn primary" @click="startCharging">
            <i class="fas fa-bolt"></i> Start Charging
          </button>
          <button class="btn" @click="findNearbyStations">
            <i class="fas fa-map-marker-alt"></i> Find Nearby
          </button>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-bolt"></i>
          </div>
          <div class="stat-info">
            <h3>Active Chargers</h3>
            <p>{{ activeChargers }} chargers available</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <h3>Nearby Chargers</h3>
            <p>{{ nearbyChargers }} nearby stations</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-info">
            <h3>Balance</h3>
            <p>${{ user.balance.toFixed(2) }}</p>
            <button class="small-btn" @click="addFunds">Add Funds</button>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <h3>Reward Points</h3>
            <p>{{ user.rewardPoints }} points</p>
            <button class="small-btn" @click="viewRewards">Redeem</button>
          </div>
        </div>
      </div>

    <!-- Nearby Stations -->
<div class="nearby-stations">
  <div class="section-header">
    <h3>Available Chargers</h3>
    <router-link to="/user-dashboard/find-stations">View All</router-link>
  </div>

  <div class="stations-grid">
    <div
      v-for="(charger, index) in displayedChargers.slice(0, 3)"
      :key="index"
      class="station-card"
      @click="navigateToStation(charger._id)"
      style="cursor: pointer"
    >
      <div class="station-image">
        <img :src="chargerImages[index % chargerImages.length]" :alt="charger.name" />
        <div class="distance-badge">Nearby</div>
      </div>
      <div class="station-info">
        <h4>{{ charger.name }}</h4>
        <div class="station-meta">
          <span><i class="fas fa-bolt"></i> {{ charger.connectorType }}</span>
          <span><i class="fas fa-tachometer-alt"></i> {{ charger.powerOutput }} kW</span>
        </div>
        <div class="station-availability">
          <span class="available">Available</span>
          <span class="price">$0.30/kWh</span>
        </div>
        <button class="btn small" @click.stop="startChargingAtStation(charger._id)">
          <i class="fas fa-bolt"></i> Start Charging
        </button>
      </div>
    </div>
  </div>
</div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <div class="section-header">
          <h3>Recent Activity</h3>
          <router-link to="/user-dashboard/find-stations">View All</router-link>
        </div>
        
        <div class="activity-list">
          <div v-for="(session, index) in recentSessions" :key="index" class="activity-item">
            <div class="activity-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="activity-details">
              <h4>{{ session.station }}</h4>
              <p>{{ session.date }} • {{ session.duration }} • {{ session.energy }} kWh</p>
            </div>
            <div class="activity-cost">
              ${{ session.cost.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BASE_URL from '@/config/baseURL'

export default {
  name: 'UserDashboard',
  setup() {
    const router = useRouter()
    const user = ref({
      username: '',
      balance: 0,
      rewardPoints: 0,
      avatar: ''
    })
    
    const activeChargers = ref(0)
    const nearbyChargers = ref(0)
    const chargers = ref([])
    const recentSessions = ref([])
    
    // Array of different charger images
    const chargerImages = ref([
      'https://media.istockphoto.com/id/1564615208/photo/ev-charging-stations-or-electric-vehicle-recharging-stations-with-graphic-display.jpg?s=612x612&w=0&k=20&c=Q0abYEWywvzsbtNIqDeGZfQNkH9kXmVhvQAQkqQS43w=',
      'https://media.istockphoto.com/id/1462935431/photo/focus-closeup-ev-car-and-charger-with-blur-background-for-progressive-concept.jpg?s=612x612&w=0&k=20&c=A2fpyarNWgEsnbqX_yYXmCglgq810ZlRg0lKESk7tJQ=',
      'https://media.istockphoto.com/id/1414117124/photo/electric-car-on-electric-car-charging-station-power-supply-for-electric-car-charging-clean.jpg?s=612x612&w=0&k=20&c=aiNliUdhWfqI_kJnfcbGU080oNm7TIfXPDC4kMG0xro=',
      'https://media.istockphoto.com/id/1399211200/photo/electric-car-charging-station-in-the-city.jpg?s=612x612&w=0&k=20&c=wGQJ5Ql1W5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q=',
      'https://media.istockphoto.com/id/1399211200/photo/electric-car-charging-station-in-the-city.jpg?s=612x612&w=0&k=20&c=wGQJ5Ql1W5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q=',
      'https://media.istockphoto.com/id/1399211200/photo/electric-car-charging-station-in-the-city.jpg?s=612x612&w=0&k=20&c=wGQJ5Ql1W5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q='
    ])

    // Only display first 6 chargers in the dashboard
    const displayedChargers = computed(() => {
      return chargers.value.slice(0, 6)
    })

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BASE_URL}/user-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = response.data

        user.value = {
          username: data.username,
          balance: data.balance || 0,
          rewardPoints: data.rewardPoints || 0,
          avatar: data.avatar || ''
        }

        activeChargers.value = data.activeChargers || 0
        nearbyChargers.value = data.nearbyChargers || 0
        
        // Initialize chargers with sample data if not provided by backend
        if (!data.chargers || data.chargers.length === 0) {
          chargers.value = [
            { _id: '1', name: 'Downtown Charging Hub', connectorType: 'Type 2', powerOutput: 22 },
            { _id: '2', name: 'Mall Parking Station', connectorType: 'CCS', powerOutput: 50 },
            { _id: '3', name: 'Highway Rest Stop #5', connectorType: 'CHAdeMO', powerOutput: 100 },
            { _id: '4', name: 'City Center Station', connectorType: 'Type 2', powerOutput: 22 },
            { _id: '5', name: 'Tech Park Charger', connectorType: 'CCS', powerOutput: 50 },
            { _id: '6', name: 'Airport Parking', connectorType: 'Tesla', powerOutput: 120 },
            { _id: '7', name: 'University Charging', connectorType: 'Type 2', powerOutput: 22 },
            { _id: '8', name: 'Shopping Plaza', connectorType: 'CCS', powerOutput: 50 }
          ]
        } else {
          chargers.value = data.chargers
        }
        
        // If recent sessions aren't provided by backend, keep the default ones
        if (!data.recentSessions) {
          recentSessions.value = [
            {
              station: "Downtown Charging Hub",
              date: "Today, 10:30 AM",
              duration: "45 min",
              energy: 22.5,
              cost: 6.75
            },
            {
              station: "Mall Parking Station",
              date: "Yesterday, 2:15 PM",
              duration: "1h 15min",
              energy: 37.8,
              cost: 11.34
            },
            {
              station: "Highway Rest Stop #5",
              date: "May 28, 2023",
              duration: "30 min",
              energy: 15.2,
              cost: 4.56
            }
          ]
        } else {
          recentSessions.value = data.recentSessions
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      }
    }

    const logout = () => {
      localStorage.removeItem('token')
      router.push('/login')
    }

    const startCharging = () => {
      router.push('/user-dashboard/find-stations')
    }

    const startChargingAtStation = (chargerId) => {
    router.push('/user-dashboard/find-stations')
      // Implement your charging logic here
    }

    const findNearbyStations = () => {
      router.push('/user-dashboard/find-stations')
    }

    const navigateToStation = (stationId) => {
      console.log('Navigating to station:', stationId)
      // Implement navigation logic here
    }

    const addFunds = () => {
      console.log('Add funds clicked')
    }

    const viewRewards = () => {
      console.log('View rewards clicked')
    }

    onMounted(() => {
      fetchUserData()
    })

    return {
      user,
      activeChargers,
      nearbyChargers,
      chargers,
      recentSessions,
      chargerImages,
      displayedChargers,
      logout,
      startCharging,
      startChargingAtStation,
      findNearbyStations,
      addFunds,
      viewRewards,
      navigateToStation,
      
    }
  }
}
</script>

<style scoped>
/* Main Layout */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 280px;
  background: linear-gradient(to bottom, #003366, #001a33);
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
}

/* Sidebar Styles */
.logo-container {
  padding: 0 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container h1 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
}

.logo-container p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.nav-menu {
  flex: 1;
  padding: 30px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  margin: 5px 0;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-left: 3px solid #4da6ff;
}

.nav-item i {
  margin-right: 15px;
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.nav-item span {
  font-size: 15px;
}

.user-profile {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.profile-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.username {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 3px;
}

.role {
  font-size: 12px;
  opacity: 0.7;
  margin: 0;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn i {
  margin-right: 8px;
}

/* Main Content Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.small {
  padding: 8px 15px;
  font-size: 14px;
}

.small-btn {
  padding: 5px 10px;
  font-size: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.small-btn:hover {
  background-color: #e9ecef;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background-color: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 20px;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #7f8c8d;
}

.stat-info p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* Recent Activity */
.recent-activity {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.section-header a {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.activity-item:hover {
  background-color: #e9ecef;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background-color: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  margin-right: 15px;
}

.activity-details {
  flex: 1;
}

.activity-details h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #2c3e50;
}

.activity-details p {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.activity-cost {
  font-weight: 600;
  color: #2c3e50;
}

/* Nearby Stations */
.nearby-stations {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.station-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.station-card:hover {
  transform: translateY(-5px);
}

.station-image {
  position: relative;
  height: 150px;
}

.station-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.distance-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.station-info {
  padding: 15px;
}

.station-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #2c3e50;
}

.station-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #7f8c8d;
}

.station-availability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.available {
  color: #27ae60;
  font-weight: 600;
}

.unavailable {
  color: #e74c3c;
  font-weight: 600;
}

.price {
  font-weight: 600;
  color: #2c3e50;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    padding: 20px 5px;
  }
  
  .logo-container h1, 
  .logo-container p,
  .nav-item span,
  .username,
  .role,
  .logout-btn span {
    display: none;
  }
  
  .logo-container {
    padding: 0 5px 20px;
    text-align: center;
  }
  
  .nav-item {
    justify-content: center;
    padding: 15px 5px;
    border-left: none;
  }
  
  .nav-item.active {
    border-left: none;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .nav-item i {
    margin-right: 0;
    font-size: 20px;
  }
  
  .profile-info {
    justify-content: center;
  }
  
  .profile-img {
    margin-right: 0;
  }
  
  .main-content {
    margin-left: 70px;
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stations-grid {
    grid-template-columns: 1fr;
  }
}
</style>