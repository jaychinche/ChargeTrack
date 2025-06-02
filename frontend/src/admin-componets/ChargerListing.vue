<template>
  <div class="admin-container">
    <!-- Side Navigation -->
    <div class="sidebar">
      <div class="logo-container">
        <h1>ChargeTrack</h1>
        <p>Admin Dashboard</p>
      </div>
      <nav class="nav-menu">
        <router-link to="/admin-dashboard" class="nav-item" active-class="active">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin-dashboard/charger-listing" class="nav-item" active-class="active">
          <i class="fas fa-charging-station"></i>
          <span>Charger Stations</span>
        </router-link>
    
        <router-link to="/admin-dashboard/bookings" class="nav-item" active-class="active">
          <i class="fas fa-calendar-check"></i>
          <span>Bookings</span>
        </router-link>
        <router-link to="/admin-dashboard/reports" class="nav-item" active-class="active">
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
          <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.username" alt="User" class="profile-img">
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
        <h2>Charger Stations Management</h2>
        <div class="header-actions">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="filters.search" placeholder="Search chargers..." @keyup.enter="fetchChargers">
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
            <p></p>
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
            <option value="">All Power Outputs</option>
            <option value="50">50 kW</option>
            <option value="75">75 kW</option>
            <option value="100">100 kW</option>
            <option value="150">150 kW</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Connector Type</label>
          <select v-model="filters.connectorType" @change="fetchChargers">
            <option value="">All Connector Types</option>
            <option value="Type 2">Type 2</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="CCS">CCS</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>

        <button class="reset-filters" @click="resetFilters">
          <i class="fas fa-sync-alt"></i> Reset
        </button>
      </div>

      <!-- Charger Table -->
      <div class="table-container">
        <div class="table-header">
          <h3>Charging Stations</h3>
          <div class="table-actions">
            <button class="export-btn">
              <i class="fas fa-file-export"></i> Export
            </button>
          </div>
        </div>

        <!-- Scrollable Table Container -->
        <div class="scroll-wrapper">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('name')" class="sortable">
                    Name
                    <i v-if="sort.field === 'name'"
                      :class="sort.order === 1 ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    <i v-else class="fas fa-sort"></i>
                  </th>
                  <th>Location</th>
                  <th>City</th>
                  <th @click="sortBy('status')" class="sortable">
                    Status
                    <i v-if="sort.field === 'status'"
                      :class="sort.order === 1 ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    <i v-else class="fas fa-sort"></i>
                  </th>
                  <th @click="sortBy('powerOutput')" class="sortable">
                    Power (kW)
                    <i v-if="sort.field === 'powerOutput'"
                      :class="sort.order === 1 ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    <i v-else class="fas fa-sort"></i>
                  </th>
                  <th>Connector Type</th>
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
                  <td>
                    <span v-if="charger.location && charger.location.coordinates">
                      {{ charger.location.coordinates[1].toFixed(4) }}, {{ charger.location.coordinates[0].toFixed(4) }}
                    </span>
                    <span v-else>N/A</span>
                  </td>
                  <td>{{ charger.city || 'N/A' }}</td>
                  <td>
                    <span :class="`status-badge status-${charger.status.toLowerCase()}`">
                      {{ charger.status }}
                    </span>
                  </td>
                  <td>{{ charger.powerOutput }}</td>
                  <td>{{ charger.connectorType }}</td>
                  <td class="actions">
                    <button class="action-btn view-btn" @click="viewCharger(charger._id)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" @click="editCharger(charger)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDelete(charger._id)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
            <i class="fas fa-chevron-left"></i> Previous
          </button>
          <div class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-btn">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>



      <!-- Add/Edit Modal -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ showAddModal ? 'Add New Charger' : 'Edit Charger' }}</h3>
            <button @click="closeModal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Name *</label>
                <input v-model="formData.name" required placeholder="Charger name" />
              </div>

              <div class="form-group">
                <label>Status *</label>
                <select v-model="formData.status" required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>City *</label>
                <input v-model="formData.city" @input="searchCities" required
                  placeholder="Start typing a city name..." />
                <ul class="city-suggestions" v-if="citySuggestions.length > 0">
                  <li v-for="city in citySuggestions" :key="city.place_id" @click="selectCity(city)">
                    {{ city.display_name }}
                  </li>
                </ul>
              </div>

              <div class="form-group">
                <label>Power Output (kW) *</label>
                <input v-model.number="formData.powerOutput" type="number" required min="1" placeholder="50" />
              </div>
            </div>

            <div class="form-group">
              <label>Connector Type *</label>
              <select v-model="formData.connectorType" required>
                <option value="Type 1 (J1772)">Type 1 (J1772)</option>
                <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
                <option value="CCS (Combo 1)">CCS (Combo 1)</option>
                <option value="CCS (Combo 2)">CCS (Combo 2)</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Tesla">Tesla</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>

            <div class="form-group">
              <label>Location *</label>
              <p class="form-hint">Click on the map to set coordinates</p>
              <div class="map-container" ref="mapContainer"></div>
              <div class="coordinates-display">
                <span><strong>Latitude:</strong> {{ formData.latitude || 'Not set' }}</span>
                <span><strong>Longitude:</strong> {{ formData.longitude || 'Not set' }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                {{ showAddModal ? 'Add Charger' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button @click="showDeleteModal = false" class="modal-close" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle fa-lg"></i>
              <p>
                Are you sure you want to delete this charging station?
                <strong>This action cannot be undone.</strong>
              </p>
            </div>
          </div>

          <div class="form-actions">
            <button @click="showDeleteModal = false" class="btn cancel-btn">
              Cancel
            </button>
            <button @click="deleteCharger" class="btn delete-btn">
              <i class="fas fa-trash-alt"></i> Delete
            </button> &nbsp;&nbsp;

          </div>
          <br>
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
          totalUsers: stats.totalUsers,
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
          totalUsers: 0,
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
        const params = {
          page: this.currentPage,
          limit: this.limit,
          sort: `${this.sort.order === 1 ? '' : '-'}${this.sort.field}`
        };
        if (this.filters.status) params.status = this.filters.status;
        if (this.filters.powerOutput) params.powerOutput = this.filters.powerOutput;
        if (this.filters.connectorType) params.connectorType = this.filters.connectorType;
        if (this.filters.search) params.search = this.filters.search;

        const response = await axios.get(`${BASE_URL}/api/v1/charging-stations`, { params });
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
/* Reuse the dashboard styles with some additions for the charger listing */

.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Sidebar styles (same as dashboard) */
.sidebar {
  width: 280px;
  background: linear-gradient(to bottom, #003366, #001a33);
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  padding: 0 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container h1 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
}

.logo-container p {
  font-size: 14px;
  opacity: 0.8;
}

.nav-menu {
  flex: 1;
  padding: 30px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
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

.user-profile {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.role {
  font-size: 12px;
  opacity: 0.7;
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
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn i {
  margin-right: 8px;
}

/* Main content styles */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  color: #003366;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  position: relative;
  margin-right: 15px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

.search-box input {
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 200px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #003366;
  width: 250px;
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
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

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

.card-1 .card-icon {
  background-color: #4e73df;
}

.card-2 .card-icon {
  background-color: #1cc88a;
}

.card-3 .card-icon {
  background-color: #36b9cc;
}

.card-4 .card-icon {
  background-color: #f6c23e;
}

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
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  min-width: 180px;
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
}

.reset-filters:hover {
  color: #003366;
}

/* Table styles */
.table-container {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 18px;
  color: #003366;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.export-btn {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
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
}

.data-table td {
  font-size: 14px;
  color: #333;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.charger-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.charger-name i {
  color: #4e73df;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
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
  gap: 5px;
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
}

.action-btn:hover {
  background-color: #f8f9fa;
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

/* Loading and empty states */
.loading-state {
  padding: 30px;
  text-align: center;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
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
}

.empty-state p {
  max-width: 400px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
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
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
}

/* Modal styles */
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
}

.modal {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
}

.modal-header h3 {
  font-size: 20px;
  color: #003366;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.modal-form {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #003366;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
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
  margin-top: 5px;
  background-color: white;
  z-index: 100;
  position: absolute;
  width: calc(100% - 30px);
}

.city-suggestions li {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
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
  align-items: center;
  margin-bottom: 20px;
}

.alert-warning {
  background-color: rgba(246, 194, 62, 0.1);
  color: #f6c23e;
}

.alert i {
  font-size: 20px;
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
}

.submit-btn {
  padding: 10px 20px;
  background-color: #4e73df;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
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
}

/* Responsive styles */
@media (max-width: 1200px) {
  .form-row {
    flex-direction: column;
    gap: 0;
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
  }

  .nav-item i {
    margin-right: 0;
  }

  .profile-info {
    justify-content: center;
  }

  .profile-img {
    margin-right: 0;
  }

  .main-content {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group select,
  .filter-group input {
    width: 100%;
  }

  .modal {
    width: 95%;
  }
}


.scroll-wrapper {
  max-height: 500px;
  /* or use 60vh */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: capitalize;
  font-size: 0.9em;
}

/* Example status badge coloring */
.status-active {
  color: green;
  background-color: #e6ffed;
}

.status-inactive {
  color: red;
  background-color: #ffe6e6;
}

.status-maintenance {
  color: #ffa500;
  background-color: #fff3cd;
}
</style>