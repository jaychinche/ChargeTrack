<template>
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

    <div class="user-profile" v-if="user">
      <div class="profile-info">
        <img :src="user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'User'}`" 
             alt="User" 
             class="profile-img">
        <div>
          <p class="username">{{ user.username }}</p>
          <p class="role">User</p>
        </div>
      </div>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BASE_URL from '@/config/baseURL'

export default {
  name: 'DashboardSidebar',
  setup() {
    const router = useRouter()
    const user = ref(null)

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const response = await axios.get(`${BASE_URL}/user-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        user.value = response.data // Assuming the response contains user object with username and avatar
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        localStorage.removeItem('token')
        router.push('/login')
      }
    }

    const logout = () => {
      localStorage.removeItem('token')
      router.push('/login')
    }

    onMounted(fetchUserData)

    return {
      user,
      logout
    }
  }
}
</script>

<style scoped>
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

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    padding: 20px 5px;
  overflow: hidden;
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
    margin: 2px 0;
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
    flex-direction: column;
    margin-bottom: 15px;
  }
  
  .profile-img {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .logout-btn i {
    margin-right: 0;
  }
}
</style>