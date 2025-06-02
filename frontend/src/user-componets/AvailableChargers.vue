<template>
<div class="admin-layout">
    <AdminSidebar :user="currentUser" @logout="handleLogout" />
    
    <div class="main-content">
      <div class="container">
        <!-- Success Alert -->
        <div v-if="showSuccessAlert" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>
        
        <!-- Error Alert -->
        <div v-if="showErrorAlert" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <div class="page-header">
          <h1><i class="fas fa-map-marker-alt"></i> Find Charging Stations</h1>
          <p>Browse and manage charging stations across your network</p>
        </div>

        <div class="layout">
          <!-- Left Side - Charger Table -->
          <div class="left-side">
            <!-- Filters -->
            <div class="filters">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="cityFilter" 
                  placeholder="Search by city..."
                  @input="handleCitySearch"
                >
              </div>
              
              <div class="filter-group">
                <label>Connector Type:</label>
                <select v-model="filters.connectorType" @change="fetchChargers">
                  <option value="">All Types</option>
                  <option value="Type 1 (J1772)">Type 1 (J1772)</option>
                  <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
                  <option value="CCS (Combo 1)">CCS (Combo 1)</option>
                  <option value="CCS (Combo 2)">CCS (Combo 2)</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Tesla">Tesla</option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Power Output:</label>
                <select v-model="filters.powerOutput" @change="fetchChargers">
                  <option value="">All Outputs</option>
                  <option value="50">50 kW</option>
                  <option value="100">100 kW</option>
                  <option value="150">150 kW</option>
                  <option value="250">250 kW</option>
                </select>
              </div>

              <button @click="fetchChargers" class="search-btn">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>

            <!-- Charger Table -->
            <div class="table-container">
              <div class="table-responsive">
                <table class="charger-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Status</th>
                     
                      <th>Action</th>
                      <th></th>
                       <th>Type</th>
                      <th>Power </th>
                 
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="charger in filteredChargers" 
                      :key="charger._id"
                      @click="focusOnCharger(charger)"
                      :class="{ 'highlight-row': highlightedCharger === charger._id }"
                    >
                    
                      <td class="station-name">
                        <i class="fas fa-charging-station"></i>
                        {{ charger.name }}
                      </td>
                      <td>{{ charger.city || 'N/A' }}&nbsp;</td>
                      
                      <td>
                        <span :class="'status-badge status-' + charger.status.toLowerCase()">
                          {{ charger.status }}
                        </span>
                      </td>
                      
                      <td>
                        <button @click.stop="openBookingForm(charger)" class="book-btn">
                          <i class="fas fa-calendar-check"></i> Book
                        </button>
                      </td>
                      <td></td>
                      <td>{{ charger.powerOutput }} kW</td>
                      <td>{{ charger.connectorType }}</td>
                      <td>
                        <span v-if="charger.location && charger.location.coordinates">
                          {{ charger.location.coordinates[1].toFixed(4) }}, {{ charger.location.coordinates[0].toFixed(4) }}
                        </span>
                        <span v-else>N/A</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <p>Loading charging stations...</p>
              </div>
              
              <!-- Empty State -->
              <div v-if="!loading && filteredChargers.length === 0" class="empty-state">
                <i class="fas fa-map-marked-alt"></i>
                <h3>No stations found</h3>
                <p>Try adjusting your search filters</p>
                <button @click="resetFilters" class="reset-btn">
                  <i class="fas fa-redo"></i> Reset Filters
                </button>
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
                <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
                <button 
                  @click="changePage(currentPage + 1)" 
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                >
                  Next <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Side - Map Display -->
          <div class="right-side">
            <div class="map-container" ref="mainMapContainer">
              <div v-if="mapLoading" class="map-loading">
                <div class="spinner"></div>
              </div>
            </div>
            <div class="map-controls">
              <button @click="zoomToAll" class="map-control-btn">
                <i class="fas fa-globe-americas"></i> View All
              </button>
              <button @click="locateUser" class="map-control-btn">
                <i class="fas fa-location-arrow"></i> My Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div class="modal-overlay" v-if="showBookingForm">
      <div class="booking-modal">
        <div class="modal-header">
          <h3>Book Charging Station</h3>
          <button @click="closeBookingForm" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="station-info">
            <h4><i class="fas fa-charging-station"></i> {{ selectedCharger.name }}</h4>
            <p><i class="fas fa-map-marker-alt"></i> {{ selectedCharger.city || 'Unknown location' }}</p>
            <p><i class="fas fa-bolt"></i> {{ selectedCharger.powerOutput }} kW • {{ selectedCharger.connectorType }}</p>
          </div>
          
          <form @submit.prevent="submitBooking">
            <div class="form-group">
              <label for="booking-date">Date *</label>
              <input 
                type="date" 
                id="booking-date" 
                v-model="bookingForm.date" 
                required
                :min="new Date().toISOString().split('T')[0]"
              >
            </div>
            
            <div class="form-group">
              <label for="booking-time">Time *</label>
              <input 
                type="time" 
                id="booking-time" 
                v-model="bookingForm.time" 
                required
              >
            </div>
            
            <div class="form-group">
              <label for="booking-duration">Duration (hours) *</label>
              <select id="booking-duration" v-model="bookingForm.duration" required>
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
              </select>
            </div>

            <div class="form-group">
              <label for="booking-vehicle">Vehicle Number *</label>
              <input 
                type="text" 
                id="booking-vehicle" 
                v-model="bookingForm.vehicleNumber" 
                required
                placeholder="Enter your vehicle registration number"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeBookingForm" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                <i class="fas fa-calendar-check"></i> Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from "@/user-componets/Sidebar.vue";
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import debounce from 'lodash/debounce';
import BASE_URL from  "@/config/baseURL";

export default {
  name: 'FindStationPage',
  components: {
    AdminSidebar
  },
  data() {
    return {
      currentUser: {
        username: 'AdminUser',
        role: 'Administrator',
        email: 'admin@example.com'
      },
      chargers: [],
      filteredChargers: [],
      loading: false,
      mapLoading: false,
      currentPage: 1,
      limit: 10,
      totalPages: 1,
      cityFilter: '',
      filters: {
        connectorType: '',
        powerOutput: ''
      },
      mainMap: null,
      markers: [],
      highlightedCharger: null,
      userLocation: null,
      userMarker: null,
      showBookingForm: false,
      selectedCharger: null,
      bookingForm: {
        date: '',
        time: '',
        duration: '1',
        notes: '',
        vehicleNumber: ''
      },
      showSuccessAlert: false,
      successMessage: '',
      showErrorAlert: false,
      errorMessage: ''
    };
  },
  computed: {
    filteredChargers() {
      if (!this.cityFilter) {
        return this.chargers;
      }
      const searchTerm = this.cityFilter.toLowerCase();
      return this.chargers.filter(charger => {
        const city = charger.city ? charger.city.toLowerCase() : '';
        return city.includes(searchTerm);
      });
    }
  },
  mounted() {
    this.initMainMap();
    this.fetchChargers();
    const now = new Date();
    this.bookingForm.date = now.toISOString().split('T')[0];
    this.bookingForm.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1;
        this.fetchChargers();
      },
      deep: true
    }
  },
  methods: {
    handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        this.$router.push('/login');
      }
    },
    
    createCustomIcon(color) {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div class="pulse-marker" style="background-color: ${color}">
                <div class="pulse-effect"></div>
                <i class="fas fa-charging-station"></i>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
    },

    initMainMap() {
      this.mapLoading = true;
      this.$nextTick(() => {
        this.mainMap = L.map(this.$refs.mainMapContainer, {
          zoomControl: false,
          fadeAnimation: true,
          zoomAnimation: true
        }).setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          detectRetina: true
        }).addTo(this.mainMap);
        
        L.control.zoom({
          position: 'topright'
        }).addTo(this.mainMap);
        
        setTimeout(() => {
          this.mainMap.invalidateSize();
        }, 100);
        
        this.mapLoading = false;
      });
    },
    
    async fetchChargers() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          limit: this.limit
        };

        if (this.filters.connectorType) params.connectorType = this.filters.connectorType;
        if (this.filters.powerOutput) params.powerOutput = this.filters.powerOutput;

        const response = await axios.get(`${BASE_URL}/api/v1/charging-stations`, { params });
        this.chargers = response.data.data;
        this.filteredChargers = [...this.chargers];
        this.totalPages = Math.ceil(response.data.count / this.limit);
        
        this.updateMapWithChargers();
      } catch (error) {
        console.error('Error fetching chargers:', error);
        this.chargers = [];
        this.filteredChargers = [];
        this.showError('Failed to load charging stations. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    
    handleCitySearch: debounce(function() {
      if (!this.cityFilter) {
        this.filteredChargers = [...this.chargers];
        return;
      }
      
      const searchTerm = this.cityFilter.toLowerCase();
      this.filteredChargers = this.chargers.filter(charger => {
        const city = charger.city ? charger.city.toLowerCase() : '';
        return city.includes(searchTerm);
      });
      
      this.updateMapWithFilteredChargers();
    }, 300),
    
    updateMapWithChargers() {
      this.markers.forEach(marker => this.mainMap.removeLayer(marker));
      this.markers = [];
      
      if (this.chargers.length === 0) {
        this.mainMap.setView([20, 0], 2);
        return;
      }
      
      this.chargers.forEach(charger => {
        if (charger.location?.coordinates) {
          const [lng, lat] = charger.location.coordinates;
          
          let color;
          switch (charger.status.toLowerCase()) {
            case 'active': color = '#28a745'; break;
            case 'inactive': color = '#dc3545'; break;
            case 'maintenance': color = '#ffc107'; break;
            default: color = '#007bff';
          }
          
          const marker = L.marker([lat, lng], {
            icon: this.createCustomIcon(color),
            riseOnHover: true
          }).addTo(this.mainMap);
          
          marker.bindPopup(
            `<div class="map-popup">
              <h4><i class="fas fa-charging-station"></i> ${charger.name}</h4>
              <p><i class="fas fa-map-pin"></i> ${charger.city || 'Unknown city'}</p>
              <p><i class="fas fa-bolt"></i> ${charger.powerOutput} kW • ${charger.connectorType}</p>
              <p>Status: <span class="status-${charger.status.toLowerCase()}">${charger.status}</span></p>
            </div>`
          );
          
          this.markers.push(marker);
        }
      });
      
      if (this.markers.length > 0) {
        const markerGroup = L.featureGroup(this.markers);
        this.mainMap.fitBounds(markerGroup.getBounds().pad(0.2));
      }
      
      this.$nextTick(() => {
        if (this.mainMap) {
          this.mainMap.invalidateSize();
        }
      });
    },
    
    updateMapWithFilteredChargers() {
      // Clear all markers first
      this.markers.forEach(marker => this.mainMap.removeLayer(marker));
      this.markers = [];
      
      // Add markers only for filtered chargers
      this.filteredChargers.forEach(charger => {
        if (charger.location?.coordinates) {
          const [lng, lat] = charger.location.coordinates;
          
          let color;
          switch (charger.status.toLowerCase()) {
            case 'active': color = '#28a745'; break;
            case 'inactive': color = '#dc3545'; break;
            case 'maintenance': color = '#ffc107'; break;
            default: color = '#007bff';
          }
          
          const marker = L.marker([lat, lng], {
            icon: this.createCustomIcon(color),
            riseOnHover: true
          }).addTo(this.mainMap);
          
          marker.bindPopup(
            `<div class="map-popup">
              <h4><i class="fas fa-charging-station"></i> ${charger.name}</h4>
              <p><i class="fas fa-map-pin"></i> ${charger.city || 'Unknown city'}</p>
              <p><i class="fas fa-bolt"></i> ${charger.powerOutput} kW • ${charger.connectorType}</p>
              <p>Status: <span class="status-${charger.status.toLowerCase()}">${charger.status}</span></p>
            </div>`
          );
          
          this.markers.push(marker);
        }
      });
      
      // Fit map to filtered markers
      if (this.markers.length > 0) {
        const markerGroup = L.featureGroup(this.markers);
        this.mainMap.fitBounds(markerGroup.getBounds().pad(0.2));
      } else {
        this.mainMap.setView([20, 0], 2);
      }
    },
    
    focusOnCharger(charger) {
      if (!charger.location?.coordinates) return;
      
      const [lng, lat] = charger.location.coordinates;
      this.mainMap.flyTo([lat, lng], 15, {
        duration: 1,
        easeLinearity: 0.25
      });
      
      this.highlightedCharger = charger._id;
      setTimeout(() => {
        this.highlightedCharger = null;
      }, 2000);
      
      const marker = this.markers.find(m => 
        m.getLatLng().lat === lat && m.getLatLng().lng === lng
      );
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 1000);
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchChargers();
      }
    },
    
    resetFilters() {
      this.cityFilter = '';
      this.filters = {
        connectorType: '',
        powerOutput: ''
      };
      this.currentPage = 1;
      this.fetchChargers();
    },
    
    zoomToAll() {
      if (this.markers.length > 0) {
        const markerGroup = L.featureGroup(this.markers);
        this.mainMap.flyToBounds(markerGroup.getBounds().pad(0.2));
      } else {
        this.mainMap.flyTo([20, 0], 2);
      }
    },
    
    locateUser() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = [position.coords.latitude, position.coords.longitude];
            this.mainMap.flyTo(this.userLocation, 13);
            
            if (this.userMarker) {
              this.mainMap.removeLayer(this.userMarker);
            }
            
            this.userMarker = L.marker(this.userLocation, {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-location-pulse"><i class="fas fa-user"></i></div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
              }),
              zIndexOffset: 1000
            }).addTo(this.mainMap);
            
            this.userMarker.bindPopup("<b>Your Location</b>").openPopup();
          },
          (error) => {
            console.error("Geolocation error:", error);
            this.showError("Unable to retrieve your location. Please ensure location services are enabled.");
          },
          { enableHighAccuracy: true }
        );
      } else {
        this.showError("Geolocation is not supported by your browser.");
      }
    },
    
    showSuccess(message) {
      this.successMessage = message;
      this.showSuccessAlert = true;
      setTimeout(() => {
        this.showSuccessAlert = false;
      }, 3000);
    },
    
    showError(message) {
      this.errorMessage = message;
      this.showErrorAlert = true;
      setTimeout(() => {
        this.showErrorAlert = false;
      }, 3000);
    },
    
    openBookingForm(charger) {
      this.selectedCharger = charger;
      this.showBookingForm = true;
      const now = new Date();
      this.bookingForm = {
        date: now.toISOString().split('T')[0],
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        duration: '1',
        notes: '',
        vehicleNumber: ''
      };
    },
    
    closeBookingForm() {
      this.showBookingForm = false;
      this.selectedCharger = null;
    },
    
    async submitBooking() {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }

        if (!this.bookingForm.vehicleNumber.trim()) {
          throw new Error('Vehicle number is required');
        }

        const response = await axios.post(
          `${BASE_URL}/user-dashboard/bookings`,
          {
            stationId: this.selectedCharger._id,
            date: this.bookingForm.date,
            time: this.bookingForm.time,
            duration: parseFloat(this.bookingForm.duration),
            vehicleNumber: this.bookingForm.vehicleNumber,
            notes: this.bookingForm.notes
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        this.showSuccess(`Booking confirmed for ${this.selectedCharger.name} on ${this.bookingForm.date} at ${this.bookingForm.time}`);
        this.closeBookingForm();
      } catch (error) {
        console.error('Error submitting booking:', error);
        
        let errorMessage = 'Failed to create booking.';
        if (error.response && error.response.data) {
          if (error.response.data.details) {
            errorMessage += ` Details: ${error.response.data.details.join(', ')}`;
          } else if (error.response.data.error) {
            errorMessage += ` ${error.response.data.error}`;
          }
        } else if (error.message) {
          errorMessage += ` ${error.message}`;
        }
        
        this.showError(errorMessage);
      }
    }
  }
};
</script>
 

<style scoped>


/* Admin Layout Styles */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  margin-left: 280px; /* Match sidebar width */
  padding: 20px;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
}

.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
  animation: fadeIn 0.5s ease-out;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95rem;
}

.layout {
  display: flex;
  gap: 1.5rem;
  animation: slideUp 0.5s ease-out;
}

.left-side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 200px);
}

.map-container {
  height: 100%;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  background: #f8f9fa;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.map-controls {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.map-control-btn {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #2c3e50;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.map-control-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.map-control-btn i {
  font-size: 0.9rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-box {
  flex-grow: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.autocomplete-dropdown div {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.autocomplete-dropdown div:hover {
  background-color: #f5f5f5;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.filter-group select {
  padding: 0.65rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 150px;
  background-color: white;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.search-btn {
  padding: 0.65rem 1.25rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(41, 128, 185, 0.2);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
}

table {
  width: 100%;
  border-collapse: collapse;
  flex-grow: 1;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr {
  transition: all 0.2s ease;
}

tr:not(.highlight-row):hover {
  background-color: #f8f9fa;
  cursor: pointer;
  transform: translateX(2px);
}

.station-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.station-name i {
  color: #3498db;
}

.highlight-row {
  background-color: #e8f4fd !important;
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% { background-color: #d0e7ff; }
  100% { background-color: #e8f4fd; }
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-inactive {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-maintenance {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.book-btn {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.book-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
  gap: 1rem;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #bdc3c7;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #7f8c8d;
  gap: 1rem;
}

.loading p {
  margin: 0;
  font-size: 0.95rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}
/* Admin Layout Styles */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  margin-left: 280px; /* Match sidebar width */
  padding: 20px;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
}

.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
  animation: fadeIn 0.5s ease-out;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95rem;
}

.layout {
  display: flex;
  gap: 1.5rem;
  animation: slideUp 0.5s ease-out;
}

.left-side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-side {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.map-container {
  height: 100%;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  background: #f8f9fa;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.map-controls {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.map-control-btn {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #2c3e50;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.map-control-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.map-control-btn i {
  font-size: 0.9rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-box {
  flex-grow: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.filter-group select {
  padding: 0.65rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 150px;
  background-color: white;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.search-btn {
  padding: 0.65rem 1.25rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(41, 128, 185, 0.2);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
}

table {
  width: 100%;
  border-collapse: collapse;
  flex-grow: 1;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr {
  transition: all 0.2s ease;
}

tr:not(.highlight-row):hover {
  background-color: #f8f9fa;
  cursor: pointer;
  transform: translateX(2px);
}

.station-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.station-name i {
  color: #3498db;
}

.highlight-row {
  background-color: #e8f4fd !important;
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% { background-color: #d0e7ff; }
  100% { background-color: #e8f4fd; }
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-inactive {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-maintenance {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
  gap: 1rem;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #bdc3c7;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #7f8c8d;
  gap: 1rem;
}

.loading p {
  margin: 0;
  font-size: 0.95rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
  gap: 1rem;
}

.empty-state i {
  font-size: 2.5rem;
  color: #bdc3c7;
}

.empty-state h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.reset-btn {
  padding: 0.65rem 1.25rem;
  background-color: #f8f9fa;
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.reset-btn:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* Custom marker styles */
.pulse-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.4);
  animation: pulse 1.5s infinite;
}

.pulse-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: inherit;
  opacity: 0.5;
  animation: ripple 2s infinite;
}

.pulse-marker i {
  position: relative;
  z-index: 1;
}

.user-location-pulse {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
  animation: pulse 1.5s infinite;
}

.user-location-pulse::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: inherit;
  opacity: 0.5;
  animation: ripple 2s infinite;
}

/* Popup styles */
.map-popup {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-width: 200px;
}

.map-popup h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-popup p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-popup i {
  width: 16px;
  text-align: center;
  color: #3498db;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .layout {
    flex-direction: column;
  }
  
  .left-side, .right-side {
    width: 100%;
  }
  
  .map-container {
    height: 500px;
  }
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 70px; /* Match collapsed sidebar width */
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box, .filter-group select {
    width: 100%;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  th, td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .page-indicator {
    order: -1;
  }
}

@media (max-width: 576px) {
  .station-name span {
    display: none;
  }
  
  td:nth-child(2), th:nth-child(2) {
    display: none;
  }
}


/* Search autocomplete dropdown */
.search-box {
  position: relative;
  width: 100%;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.autocomplete-dropdown div {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.autocomplete-dropdown div:hover {
  background-color: #f5f5f5;
}

/* Booking modal styles */
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
  z-index: 2000;
}

.booking-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #777;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.station-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.station-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.station-info p {
  margin: 5px 0;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 15px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}

.cancel-btn:hover {
  background: #e9e9e9;
}

.submit-btn {
  padding: 10px 15px;
  background: #4CAF50;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  background: #45a049;
}

.submit-btn i {
  font-size: 0.9rem;
}
  

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
/* Responsive adjustments */
@media (max-width: 768px) {
  .booking-modal {
    width: 95%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }



  .admin-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.layout {
  display: flex;
  gap: 20px;
}

.left-side {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.right-side {
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.map-container {
  height: 500px;
  border-radius: 8px 8px 0 0;
  position: relative;
}

.map-controls {
  padding: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #eee;
}

.map-control-btn {
  padding: 8px 12px;
  background: #f0f4f8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-size: 12px;
  margin-bottom: 5px;
  color: #666;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-btn {
  padding: 8px 15px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 12px 15px;
  background: #f8f9fc;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #eee;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tr:hover {
  background-color: #f9f9f9;
}

.highlight-row {
  background-color: #e6f7ff !important;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #e6f7e6;
  color: #28a745;
}

.status-inactive {
  background-color: #feeaea;
  color: #dc3545;
}

.status-maintenance {
  background-color: #fff8e6;
  color: #ffc107;
}

.book-btn {
  padding: 6px 12px;
  background: #4e73df;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.station-name {
  font-weight: 600;
  color: #333;
}

.loading {
  padding: 40px 0;
  text-align: center;
}

.spinner {
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #4e73df;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state i {
  font-size: 40px;
  color: #ccc;
  margin-bottom: 15px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #444;
}

.reset-btn {
  padding: 8px 15px;
  background: #f0f4f8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 14px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.booking-modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.station-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.station-info h4 {
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.station-info p {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 8px 15px;
  background: #f0f4f8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}



}
</style>