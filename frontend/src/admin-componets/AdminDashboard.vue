<template>
  <div class="admin-container">
    <!-- Side Navigation -->
    <div class="sidebar">
      <div class="logo-container">
        <h1>ChargeTrack</h1>

      </div>
      
      <nav class="nav-menu">
        <router-link to="/admin-dashboard" class="nav-item" active-class="active">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>
         <router-link to="/admin-dashboard/booking-show" class="nav-item" active-class="active">
          <i class="fas fa-calendar-check"></i>
          <span>Bookings</span>
        </router-link>
       
       
        <router-link to="/admin-dashboard/booking-show" class="nav-item" active-class="active">
          <i class="fas fa-chart-bar"></i>
          <span>Reports</span>
        </router-link>
         <router-link to="/admin-dashboard/settings" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Settings</span>
        </router-link>
      </nav>
      
      <div class="user-profile">
        <div class="profile-info">
          <img :src="user.avatar || 'https://ui-avatars.com/api/?name='+user.username" alt="User" class="profile-img">
          <div>
            <p class="username">{{ user.username }}</p>
            <p class="role">{{ user.role }}</p>
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
        <div class="header-title">
          <h2>ChargeTrack</h2>
          
        </div>
        <div class="header-actions">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="filters.search" 
              placeholder="Search chargers..."
              @keyup.enter="fetchChargers"
            >
          </div>
          <button class="notification-btn">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </button>
          <button class="add-btn" @click="openAddModal">
            <i class="fas fa-plus"></i> Add Charger
          </button>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-container">
        <div class="stat-card card-1">
          <div class="card-icon">
            <i class="fas fa-charging-station"></i>
          </div>
          <div class="card-content">
            <h3>Total Chargers</h3>
            <p>{{ stats.totalChargers || 0 }}</p>
          </div>
        </div>
        <div class="stat-card card-2">
          <div class="card-icon">
            <i class="fas fa-bolt"></i>
          </div>
          <div class="card-content">
            <h3>Active Chargers</h3>
            <p>{{ stats.activeChargers }}</p>
            <span class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              5.2% increase
            </span>
          </div>
        </div>
        <div class="stat-card card-3">
          <div class="card-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="card-content">
            <h3>In Maintenance</h3>
            <p>{{ stats.inactiveChargers }}</p>
          </div>
        </div>
        <div class="stat-card card-4">
          <div class="card-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="card-content">
            <h3>Locations</h3>
            <p>{{ stats.locations }}</p>
            <span class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              3.1% increase
            </span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-container">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="fetchChargers">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Power Output</label>
          <select v-model="filters.powerOutput" @change="fetchChargers">
            <option value="">All Power</option>
            <option value="50">50 kW</option>
            <option value="100">100 kW</option>
            <option value="150">150 kW</option>
            <option value="250">250 kW</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Connector Type</label>
          <select v-model="filters.connectorType" @change="fetchChargers">
            <option value="">All Types</option>
            <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
            <option value="CCS (Combo 2)">CCS (Combo 2)</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="Tesla Supercharger">Tesla Supercharger</option>
          </select>
        </div>
        <button class="reset-filters" @click="resetFilters">
          <i class="fas fa-sync-alt"></i> Reset
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading charging stations...
      </div>

      <!-- Empty State -->
      <div v-if="!loading && chargers.length === 0" class="empty-state">
        <i class="fas fa-charging-station"></i>
        <h4>No charging stations found</h4>
        <p>Try adjusting your filters or add a new charging station</p>
        <button class="add-btn" @click="openAddModal">
          <i class="fas fa-plus"></i> Add New Charger
        </button>
      </div>

      <!-- Chargers Table -->
      <div class="table-container" v-if="!loading && chargers.length > 0">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" @click="sortBy('name')">
                  Name
                  <i class="fas fa-sort" :class="{
                    'fa-sort-up': sort.field === 'name' && sort.order === 1,
                    'fa-sort-down': sort.field === 'name' && sort.order === -1
                  }"></i>
                </th>
                <th>Location</th>
                <th class="sortable" @click="sortBy('status')">
                  Status
                  <i class="fas fa-sort" :class="{
                    'fa-sort-up': sort.field === 'status' && sort.order === 1,
                    'fa-sort-down': sort.field === 'status' && sort.order === -1
                  }"></i>
                </th>
                <th class="sortable" @click="sortBy('powerOutput')">
                  Power (kW)
                  <i class="fas fa-sort" :class="{
                    'fa-sort-up': sort.field === 'powerOutput' && sort.order === 1,
                    'fa-sort-down': sort.field === 'powerOutput' && sort.order === -1
                  }"></i>
                </th>
                <th>Connector</th>
                <th>Actions</th>
          
                         
              </tr>
            </thead>
            <tbody>
              <tr v-for="charger in chargers" :key="charger._id">
                <td>
                  <div class="charger-name">
                    <i class="fas fa-charging-station"></i>
                    {{ charger.name }}
                  </div>
                </td>
                <td>{{ charger.city }}</td>
                <td>
                  <span class="status-badge" :class="'status-' + charger.status.toLowerCase()">
                    {{ charger.status }}
                  </span>
                </td>
                <td>{{ charger.powerOutput }} kW</td>
                <td>{{ charger.connectorType }}</td>
                <td>
                  <div class="actions">
                    <button class="action-btn view-btn" @click="viewCharger(charger._id)" title="View">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" @click="editCharger(charger)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDelete(charger._id)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <div class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Add Charger Modal -->
      <div class="modal-overlay" v-if="showAddModal || showEditModal">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>{{ showAddModal ? 'Add New Charger' : 'Edit Charger' }}</h3>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form class="modal-form" @submit.prevent="submitForm">
              <div class="form-group">
                <label>Charger Name *</label>
                <input type="text" v-model="formData.name" required placeholder="e.g. Supercharger X1">
              </div>
              
              <div class="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  v-model="formData.city" 
                  @input="searchCities"
                  required
                  placeholder="Search for city..."
                >
                <ul class="city-suggestions" v-if="citySuggestions.length > 0">
                  <li 
                    v-for="(city, index) in citySuggestions" 
                    :key="index"
                    @click="selectCity(city)"
                  >
                    {{ city.display_name }}
                  </li>
                </ul>
              </div>
              
              <div class="form-group">
                <label>Location on Map</label>
                <div class="map-container" ref="mapContainer"></div>
                <div class="coordinates-display">
                  <span>Lat: {{ formData.latitude }}</span>
                  <span>Lng: {{ formData.longitude }}</span>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Status *</label>
                  <select v-model="formData.status" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Power Output (kW) *</label>
                  <input 
                    type="number" 
                    v-model="formData.powerOutput" 
                    min="10" 
                    max="350" 
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Connector Type *</label>
                <select v-model="formData.connectorType" required>
                  <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
                  <option value="CCS (Combo 2)">CCS (Combo 2)</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Tesla Supercharger">Tesla Supercharger</option>
                </select>
              </div>
              
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeModal">
                  Cancel
                </button>
                <button type="submit" class="submit-btn">
                  {{ showAddModal ? 'Add Charger' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" v-if="showDeleteModal">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button class="modal-close" @click="showDeleteModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Are you sure you want to delete this charger station? This action cannot be undone.</p>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="showDeleteModal = false">
                Cancel
              </button>
              <button type="button" class="delete-btn" @click="deleteCharger">
                <i class="fas fa-trash"></i> Delete Charger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BASE_URL from '@/config/baseURL';

export default {
  name: 'ChargerListingDashboard',
  data() {
    return {
      user: {
        username: 'AdminUser',
        role: 'Administrator',
        email: 'admin@example.com'
      },
      stats: {
        totalChargers: 0,
        activeChargers: 0,
        inactiveChargers: 0,
        locations: 0
      },
      chargers: [],
      loading: false,
      currentPage: 1,
      limit: 10,
      totalPages: 1,
      filters: {
        status: '',
        powerOutput: '',
        connectorType: '',
        search: ''
      },
      sort: {
        field: 'name',
        order: 1 // 1 for asc, -1 for desc
      },
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      formData: {
        name: '',
        city: '',
        latitude: '',
        longitude: '',
        status: 'Active',
        powerOutput: 50,
        connectorType: 'Type 2 (Mennekes)'
      },
      citySuggestions: [],
      map: null,
      marker: null,
      chargerToDelete: null,
      editingChargerId: null
    };
  },
  mounted() {
    this.fetchDashboardStats();
    this.fetchChargers();
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1;
        this.fetchChargers();
      },
      deep: true
    },
    sort: {
      handler() {
        this.fetchChargers();
      },
      deep: true
    }
  },
  methods: {
    async fetchDashboardStats() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/v1/charging-stations/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { stats, user } = response.data.data;

        this.stats = {
          totalChargers: stats.totalChargers,
          activeChargers: stats.activeChargers,
          inactiveChargers: stats.inactiveChargers,
          locations: stats.locations || 0
        };

        this.user = user || {
          username: 'AdminUser',
          role: 'Administrator',
          email: 'admin@example.com',
        };

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        this.stats = {
          totalChargers: 0,
          activeChargers: 0,
          inactiveChargers: 0,
          locations: 0
        };

        this.user = {
          username: 'AdminUser',
          role: 'Administrator',
          email: 'admin@example.com',
        };
      }
    },
    async fetchChargers() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const params = {
          page: this.currentPage,
          limit: this.limit,
          sort: `${this.sort.order === 1 ? '' : '-'}${this.sort.field}`
        };

        if (this.filters.status) params.status = this.filters.status;
        if (this.filters.powerOutput) params.powerOutput = this.filters.powerOutput;
        if (this.filters.connectorType) params.connectorType = this.filters.connectorType;
        if (this.filters.search) params.search = this.filters.search;

        const response = await axios.get(`${BASE_URL}/api/v1/charging-stations`, { 
          params,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.chargers = response.data.data;
        this.totalPages = Math.ceil(response.data.count / this.limit);
      } catch (error) {
        console.error('Error fetching chargers:', error);
        this.chargers = [];
      } finally {
        this.loading = false;
      }
    },
    sortBy(field) {
      if (this.sort.field === field) {
        this.sort.order = this.sort.order === 1 ? -1 : 1;
      } else {
        this.sort.field = field;
        this.sort.order = 1;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchChargers();
      }
    },
    resetFilters() {
      this.filters = {
        status: '',
        powerOutput: '',
        connectorType: '',
        search: ''
      };
      this.sort = {
        field: 'name',
        order: 1
      };
      this.currentPage = 1;
      this.fetchChargers();
    },
    openAddModal() {
      this.showAddModal = true;
      this.$nextTick(() => {
        this.initMap();
        if (!this.formData.latitude || !this.formData.longitude) {
          this.setDefaultPosition();
        }
      });
    },
    viewCharger(id) {
      this.$router.push(`${BASE_URL}/admin-dashboard/charger-details/${id}`);
    },
    editCharger(charger) {
      this.editingChargerId = charger._id;
      this.formData = {
        name: charger.name,
        city: charger.city || '',
        latitude: charger.location?.coordinates?.[1] || '',
        longitude: charger.location?.coordinates?.[0] || '',
        status: charger.status,
        powerOutput: charger.powerOutput,
        connectorType: charger.connectorType
      };
      this.showEditModal = true;
      
      this.$nextTick(() => {
        this.initMap();
        if (this.formData.latitude && this.formData.longitude) {
          this.setMarker(this.formData.latitude, this.formData.longitude);
          this.map.setView([this.formData.latitude, this.formData.longitude], 13);
        } else {
          this.setDefaultPosition();
        }
      });
    },
    setDefaultPosition() {
      // Default to center of Europe
      const defaultLat = 51.505;
      const defaultLng = -0.09;
      
      this.formData.latitude = defaultLat;
      this.formData.longitude = defaultLng;
      
      if (this.map) {
        this.map.setView([defaultLat, defaultLng], 5);
      }
    },
    confirmDelete(id) {
      this.chargerToDelete = id;
      this.showDeleteModal = true;
    },
    async deleteCharger() {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BASE_URL}/api/v1/charging-stations/${this.chargerToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.showDeleteModal = false;
        this.fetchChargers();
        this.fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting charger:', error);
        alert('Failed to delete charger. Please try again.');
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.citySuggestions = [];
      if (this.map) {
        this.map.remove();
        this.map = null;
        this.marker = null;
      }
      this.formData = {
        name: '',
        city: '',
        latitude: '',
        longitude: '',
        status: 'Active',
        powerOutput: 50,
        connectorType: 'Type 2 (Mennekes)'
      };
      this.editingChargerId = null;
    },
    async searchCities() {
      if (this.formData.city.length < 3) {
        this.citySuggestions = [];
        return;
      }
      
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${this.formData.city}&addressdetails=1`);
        this.citySuggestions = response.data;
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        this.citySuggestions = [];
      }
    },
    selectCity(city) {
      this.formData.city = city.display_name.split(',')[0];
      this.formData.latitude = city.lat;
      this.formData.longitude = city.lon;
      this.citySuggestions = [];
      
      this.$nextTick(() => {
        if (!this.map) {
          this.initMap();
        }
        this.setMarker(city.lat, city.lon);
        this.map.setView([city.lat, city.lon], 13);
      });
    },
    initMap() {
      if (this.map) return;
      
      const lat = this.formData.latitude || 51.505;
      const lng = this.formData.longitude || -0.09;
      const zoom = this.formData.latitude && this.formData.longitude ? 13 : 5;
      
      this.map = L.map(this.$refs.mapContainer).setView([lat, lng], zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      
      this.map.on('click', (e) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
        this.formData.latitude = e.latlng.lat;
        this.formData.longitude = e.latlng.lng;
      });
      
      if (this.formData.latitude && this.formData.longitude) {
        this.setMarker(this.formData.latitude, this.formData.longitude);
      }
    },
    setMarker(lat, lng) {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      
      this.marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map);
      
      this.marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        this.formData.latitude = newLatLng.lat;
        this.formData.longitude = newLatLng.lng;
      });
      
      this.map.setView([lat, lng], 13);
    },
    async submitForm() {
      try {
        const token = localStorage.getItem('token');
        const payload = {
          name: this.formData.name.trim(),
          city: this.formData.city.trim(),
          location: {
            type: "Point",
            coordinates: [
              parseFloat(this.formData.longitude),
              parseFloat(this.formData.latitude)
            ]
          },
          status: this.formData.status,
          powerOutput: parseInt(this.formData.powerOutput, 10),
          connectorType: this.formData.connectorType
        };

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        if (this.showAddModal) {
          await axios.post(`${BASE_URL}/api/v1/charging-stations`, payload, config);
        } else {
          await axios.put(
            `${BASE_URL}/api/v1/charging-stations/${this.editingChargerId}`,
            payload,
            config
          );
        }

        this.closeModal();
        this.fetchChargers();
        this.fetchDashboardStats();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error saving charger. Please check the data and try again.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
/* Sidebar Styles */
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

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 30px;
  margin-left: 280px;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-title h2 {
  font-size: 24px;
  color: #003366;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.breadcrumb {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 14px;
}

.search-box input {
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 100%;
  font-size: 14px;
  transition: all 0.3s;
  outline: none;
}

.search-box input:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
}

.notification-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.notification-btn:hover {
  background-color: #f5f5f5;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  background-color: #4e73df;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.add-btn:hover {
  background-color: #3a5bc7;
}

/* Stats Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-1 { border-color: #4e73df; }
.card-2 { border-color: #1cc88a; }
.card-3 { border-color: #36b9cc; }
.card-4 { border-color: #f6c23e; }

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.card-1 .card-icon { background-color: #4e73df; }
.card-2 .card-icon { background-color: #1cc88a; }
.card-3 .card-icon { background-color: #36b9cc; }
.card-4 .card-icon { background-color: #f6c23e; }

.card-content h3 {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 5px;
}

.card-content p {
  font-size: 24px;
  font-weight: 700;
  color: #003366;
  margin-bottom: 5px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.card-trend i {
  margin-right: 5px;
  font-size: 10px;
}

.positive {
  color: #1cc88a;
}

.negative {
  color: #e74a3b;
}

/* Filters */
.filters-container {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 180px;
}

.filter-group label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
  background-color: white;
  transition: border-color 0.3s;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
}

.reset-filters {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  padding: 8px 12px;
  transition: color 0.3s;
}

.reset-filters:hover {
  color: #003366;
}

/* Table Styles */
.table-container {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th, 
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  font-weight: 600;
  color: #003366;
  font-size: 14px;
  white-space: nowrap;
  position: relative;
}

.data-table td {
  font-size: 14px;
  color: #333;
  vertical-align: middle;
}

.data-table tr:hover td {
  background-color: #f8f9fa;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: #f1f3f9;
}

.sortable i {
  margin-left: 5px;
}

.charger-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.charger-name i {
  color: #4e73df;
  font-size: 18px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-align: center;
  min-width: 80px;
}

.status-active {
  background-color: rgba(28, 200, 138, 0.1);
  color: #1cc88a;
}

.status-inactive {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.status-maintenance {
  background-color: rgba(246, 194, 62, 0.1);
  color: #f6c23e;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f1f3f9;
}

.view-btn {
  color: #4e73df;
}

.edit-btn {
  color: #36b9cc;
}

.delete-btn {
  color: #e74a3b;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  background-color: white;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.loading-state {
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
  color: #4e73df;
}

.empty-state {
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-state i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-state h4 {
  color: #003366;
  font-size: 18px;
  margin: 0;
}

.empty-state p {
  max-width: 400px;
  margin: 0 0 15px 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.3s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f1f3f9;
  border-color: #ccc;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
  min-width: 100px;
  text-align: center;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background-color: white;
  border-radius: 10px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-sm {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-header h3 {
  font-size: 20px;
  color: #003366;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  color: #003366;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 20px;
}

.modal-form {
  padding: 0;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  margin-bottom: 15px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #003366;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.city-suggestions {
  list-style: none;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: -1px;
  background-color: white;
  z-index: 100;
  position: absolute;
  width: calc(100% - 2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.city-suggestions li {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.city-suggestions li:hover {
  background-color: #f8f9fa;
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-top: 10px;
}

.coordinates-display {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 14px;
  color: #6c757d;
}

.alert {
  padding: 15px;
  border-radius: 5px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.alert-warning {
  background-color: rgba(246, 194, 62, 0.1);
  color: #f6c23e;
  border-left: 4px solid #f6c23e;
}

.alert i {
  font-size: 20px;
  margin-top: 2px;
}

.alert p {
  margin: 0;
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3a5bc7;
}

.delete-btn {
  padding: 10px 20px;
  background-color: #e74a3b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #d62c1a;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .filter-group {
    min-width: 160px;
  }
}

@media (max-width: 992px) {
  .stats-container {
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
    align-items: stretch;
    gap: 15px;
  }
  
  .header-actions {
    width: 50%;
   
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .modal {
    width: 95%;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-info {
    order: -1;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn,
  .delete-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>