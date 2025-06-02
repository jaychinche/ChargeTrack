<template>
  <div class="admin-container">
    <AdminSidebar :user="adminUser" @logout="handleLogout" />
    <div class="sidebar-placeholder"></div>
    <div class="main-content">
      <div class="header">
        <h2>&nbsp;&nbsp;Booking Management</h2>
        <div class="header-actions">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by ID, user, station or vehicle..." 
              v-model="searchQuery" 
              @input="handleSearch"
            >
          </div>
          <button class="refresh-btn" @click="fetchBookings">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> 
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>
      
      <div class="content-card">
        <div class="filters">
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="statusFilter" @change="applyFilters">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Date Range:</label>
            <div class="date-range">
              <input type="date" v-model="startDate" @change="applyFilters">
              <span class="date-separator">to</span>
              <input type="date" v-model="endDate" @change="applyFilters">
            </div>
          </div>
          
          <button class="clear-btn" @click="clearFilters" :disabled="!hasFilters">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
        
        <div class="bookings-table">
          <div class="table-header">
            <div 
              class="header-cell" 
              v-for="header in tableHeaders" 
              :key="header.key" 
              :style="{ width: header.width }"
              @click="header.sortable ? sortBy(header.key) : null"
              :class="{ sortable: header.sortable }"
            >
              {{ header.label }}
              <i 
                v-if="header.sortable" 
                class="fas" 
                :class="{
                  'fa-sort': sortField !== header.key, 
                  'fa-sort-up': sortField === header.key && sortOrder === 'asc',
                  'fa-sort-down': sortField === header.key && sortOrder === 'desc'
                }"
              ></i>
            </div>
            <div class="header-cell actions">Actions</div>
          </div>
          
          <div class="table-body">
            <div v-if="loading" class="loading-row">
              <i class="fas fa-spinner fa-spin"></i> Loading bookings...
            </div>
            
            <div v-else-if="bookings.length === 0" class="empty-row">
              <i class="fas fa-calendar-times"></i>
              <p>No bookings found</p>
              <button @click="clearFilters" v-if="hasFilters">Clear filters</button>
            </div>
            
            <div v-else v-for="booking in bookings" :key="booking._id" class="table-row">
           
              <div class="table-cell">
                <div class="user-info">
                 
                  <div>
                  
                   <b><h2><span class="email">{{ booking.user?.email || '' }}</span></h2></b> 
                  </div>
                </div>
              </div>
              <div class="table-cell">
                <div class="station-info">
                
                  <div>
                    <span class="name">{{ booking.station?.name || 'Unknown Station' }}</span>
                    <span class="address">{{ booking.station?.location?.address || '' }}</span>
                  </div>
                </div>
              </div>
              <div class="table-cell date-cell">
                <div class="date">{{ formatDate(booking.date) }}</div>
                <div class="day">{{ getDayOfWeek(booking.date) }}</div>
              </div>
              <div class="table-cell time-cell">
                <div class="time-slot">
                  {{ formatTime(booking.date) }} - {{ formatEndTime(booking.date, booking.duration) }}
                </div>
                <div class="duration">{{ booking.duration }} hour{{ booking.duration !== 1 ? 's' : '' }}</div>
              </div>
              <div class="table-cell">
                <span class="status-badge" :class="booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
              <div class="table-cell price-cell">${{ (booking.duration * 10).toFixed(2) }}</div>
              <div class="table-cell actions">
                <button 
                  class="action-btn view" 
                  @click="viewBooking(booking._id)"
                  title="View details"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <button 
                  class="action-btn delete" 
                  @click="confirmDelete(booking._id)"
                  title="Delete booking"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="table-footer" v-if="bookings.length > 0">
            <div class="pagination-info">
              Showing {{ pagination.start }} to {{ pagination.end }} of {{ pagination.total }} bookings
            </div>
            <div class="pagination-controls">
              <button 
                :disabled="pagination.currentPage === 1" 
                @click="prevPage"
                title="Previous page"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>Page {{ pagination.currentPage }} of {{ pagination.totalPages }}</span>
              <button 
                :disabled="pagination.currentPage === pagination.totalPages" 
                @click="nextPage"
                title="Next page"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Booking Detail Modal -->
    <div v-if="selectedBooking" class="modal-overlay" @click.self="selectedBooking = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Booking Details</h3>
          <button class="close-btn" @click="selectedBooking = null" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          
          <div class="detail-row">
            <span class="detail-label">User:</span>
            <span class="detail-value">
              <div class="user-info">
               
                <div>
          
                  <span class="email">{{ selectedBooking.user?.email || '' }}</span>
                </div>
              </div>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Station:</span>
            <span class="detail-value">
              <div class="station-info">
                
                <div>
                  <span class="name">{{ selectedBooking.station?.name || 'Unknown Station' }}</span>
                  <span class="address">{{ selectedBooking.station?.location?.address || '' }}</span>
                </div>
              </div>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">
              {{ formatDate(selectedBooking.date) }} ({{ getDayOfWeek(selectedBooking.date) }})
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot:</span>
            <span class="detail-value">
              {{ formatTime(selectedBooking.date) }} - {{ formatEndTime(selectedBooking.date, selectedBooking.duration) }}
              ({{ selectedBooking.duration }} hour{{ selectedBooking.duration !== 1 ? 's' : '' }})
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge" :class="selectedBooking.status.toLowerCase()">
                {{ selectedBooking.status }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Price:</span>
            <span class="detail-value">${{ (selectedBooking.duration * 10).toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Vehicle Number:</span>
            <span class="detail-value">{{ selectedBooking.vehicleNumber || 'N/A' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Notes:</span>
            <span class="detail-value">{{ selectedBooking.notes || 'None' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Status:</span>
            <span class="detail-value">
              <span class="status-badge" :class="selectedBooking.status === 'confirmed' ? 'completed' : 'pending'">
                {{ selectedBooking.status === 'confirmed' ? 'Completed' : 'Pending' }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Created At:</span>
            <span class="detail-value">{{ formatDateTime(selectedBooking.createdAt) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="selectedBooking = null">
            <i class="fas fa-times"></i> Close
          </button>
          <button 
            class="btn primary" 
            @click="editBooking(selectedBooking._id)"
            :disabled="selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed'"
          >
            <i class="fas fa-edit"></i> Edit Booking
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="confirmation-modal">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this booking?</p>
          <p>This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showDeleteModal = false">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn danger" @click="deleteBooking">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
    </div>

</template>

<script>
import AdminSidebar from './AdminSidebar.vue';
import axios from 'axios';
import BASE_URL from '@/config/baseURL';

export default {
  name: 'AdminBookings',
  components: {
    AdminSidebar
  },
  data() {
    return {
      adminUser: {
        username: 'Admin',
        role: 'Administrator',
        email: 'admin@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      bookings: [],
      loading: false,
      searchQuery: '',
      statusFilter: 'all',
      startDate: '',
      endDate: '',
      sortField: 'createdAt',
      sortOrder: 'desc',
      tableHeaders: [
     
        { key: 'user.name', label: 'User', width: '180px', sortable: true },
        { key: 'station.name', label: 'Station', width: '180px', sortable: true },
        { key: 'date', label: 'Date', width: '120px', sortable: true },
        { key: 'timeSlot', label: 'Time Slot', width: '160px', sortable: false },
        { key: 'status', label: 'Status', width: '120px', sortable: true },
        { key: 'totalPrice', label: 'Amount', width: '100px', sortable: true }
      ],
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        total: 0,
        totalPages: 1
      },
      selectedBooking: null,
      showDeleteModal: false,
      bookingToDelete: null,
      searchTimeout: null,
      defaultAvatar: 'https://ui-avatars.com/api/?name=User&background=random',
      defaultStationImage: 'https://via.placeholder.com/50/3d5afe/FFFFFF?text=CS'
    };
  },
  computed: {
    paginationInfo() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
      const end = Math.min(
        this.pagination.currentPage * this.pagination.itemsPerPage,
        this.pagination.total
      );
      return {
        start,
        end,
        total: this.pagination.total,
        totalPages: this.pagination.totalPages
      };
    },
    hasFilters() {
      return (
        this.searchQuery !== '' ||
        this.statusFilter !== 'all' ||
        this.startDate !== '' ||
        this.endDate !== ''
      );
    }
  },
  created() {
    this.fetchBookings();
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDate = this.formatDateForInput(firstDay);
    this.endDate = this.formatDateForInput(lastDay);
  },
  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/admin/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            search: this.searchQuery,
            status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
            startDate: this.startDate,
            endDate: this.endDate,
            sortBy: this.sortField,
            sortOrder: this.sortOrder,
            page: this.pagination.currentPage,
            limit: this.pagination.itemsPerPage
          }
        });
        
        this.bookings = response.data.bookings;
        this.pagination.total = response.data.total;
        this.pagination.totalPages = response.data.totalPages;
      } catch (error) {
        console.error('Error fetching bookings:', error);
        this.$toast.error('Failed to fetch bookings. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.currentPage = 1;
        this.fetchBookings();
      }, 500);
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'asc';
      }
      this.fetchBookings();
    },
    applyFilters() {
      this.pagination.currentPage = 1;
      this.fetchBookings();
    },
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = 'all';
      this.startDate = '';
      this.endDate = '';
      this.sortField = 'createdAt';
      this.sortOrder = 'desc';
      this.pagination.currentPage = 1;
      this.fetchBookings();
    },
    prevPage() {
      if (this.pagination.currentPage > 1) {
        this.pagination.currentPage--;
        this.fetchBookings();
      }
    },
    nextPage() {
      if (this.pagination.currentPage < this.pagination.totalPages) {
        this.pagination.currentPage++;
        this.fetchBookings();
      }
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
    getDayOfWeek(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    },
    formatTime(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    },
    formatEndTime(date, duration) {
      if (!date || !duration) return 'N/A';
      const endTime = new Date(new Date(date).getTime() + duration * 60 * 60 * 1000);
      return endTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    },
    formatDateTime(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },
    formatDateForInput(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    async viewBooking(id) {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/admin/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.selectedBooking = response.data.booking;
      } catch (error) {
        console.error('Error fetching booking details:', error);
        this.$toast.error('Failed to load booking details');
      } finally {
        this.loading = false;
      }
    },
    editBooking(id) {
      this.$router.push(`${BASE_URL}/admin/bookings/edit/${id}`);
    },
    confirmDelete(id) {
      this.bookingToDelete = id;
      this.showDeleteModal = true;
    },



   async deleteBooking() {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BASE_URL}/admin/bookings/${this.bookingToDelete}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove the deleted booking from local state without refreshing
        this.bookings = this.bookings.filter(booking => booking._id !== this.bookingToDelete);
        
        // Update pagination total count
        this.pagination.total -= 1;
        
        // Close the modal and show success message
        this.showDeleteModal = false;
        this.$toast.success('Booking deleted successfully');
        
        // If we're viewing the deleted booking in the detail modal, close it
        if (this.selectedBooking && this.selectedBooking._id === this.bookingToDelete) {
          this.selectedBooking = null;
        }
        
        // Reset the bookingToDelete
        this.bookingToDelete = null;
        
      } catch (error) {
        console.error('Error deleting booking:', error);
        this.$toast.error('Failed to delete booking');
      }
    },
    
    // ... (keep all remaining methods the same)
  

    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 250px; /* Match sidebar width */
  transition: margin-left 0.3s;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #e0e0e0;
  transition: border-color 0.3s;
}

.search-box:hover {
  border-color: #b0b0b0;
}

.search-box i {
  color: #7f8c8d;
}

.search-box input {
  border: none;
  outline: none;
  margin-left: 0.5rem;
  width: 250px;
  font-size: 0.9rem;
}

.refresh-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background: #3d8b40;
}

.content-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.filter-group select, .filter-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 180px;
}

.filter-group select:focus, .filter-group input:focus {
  outline: none;
  border-color: #3d5afe;
  box-shadow: 0 0 0 2px rgba(61, 90, 254, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  width: 140px;
}

.date-separator {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.clear-btn {
  background: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.clear-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bookings-table {
  margin-top: 1.5rem;
  overflow-x: auto;
}

.table-header {
  display: flex;
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: #444;
  font-size: 0.85rem;
}

.header-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.header-cell.sortable {
  cursor: pointer;
  user-select: none;
}

.header-cell.sortable:hover {
  background: #f0f0f0;
  border-radius: 4px;
}

.header-cell.actions {
  width: 120px;
  flex: none;
  justify-content: center;
}

.table-body {
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 8px 8px;
  min-height: 200px;
}

.table-row {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-cell.actions {
  width: 120px;
  flex: none;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.user-info, .station-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info img, .station-info img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info .name, .station-info .name {
  font-weight: 500;
  display: block;
}

.user-info .email, .station-info .address {
  font-size: 0.75rem;
  color: #7f8c8d;
  display: block;
}

.date-cell .date {
  font-weight: 500;
}

.date-cell .day {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.time-cell .time-slot {
  font-weight: 500;
}

.time-cell .duration {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.status-badge.pending {
  background: #FFF3CD;
  color: #856404;
}

.status-badge.confirmed {
  background: #D4EDDA;
  color: #155724;
}

.status-badge.cancelled {
  background: #F8D7DA;
  color: #721C24;
}

.status-badge.completed {
  background: #D1ECF1;
  color: #0C5460;
}

.price-cell {
  font-weight: 500;
  color: #2c3e50;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.view {
  background: #E3F2FD;
  color: #1976D2;
}

.action-btn.view:hover {
  background: #bbdefb;
}

.action-btn.delete {
  background: #FFEBEE;
  color: #D32F2F;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.loading-row, .empty-row {
  padding: 2rem;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-row i, .empty-row i {
  font-size: 2rem;
  color: #7f8c8d;
}

.empty-row button {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.empty-row button:hover {
  background: #e0e0e0;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-controls button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #b0b0b0;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 700px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.detail-label {
  font-weight: 600;
  width: 150px;
  color: #555;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #333;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  background: white;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn i {
  font-size: 0.9rem;
}

.btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn.secondary:hover {
  background: #e0e0e0;
}

.btn.primary {
  background: #2196F3;
  color: white;
  border: none;
}

.btn.primary:hover {
  background: #0d8bf2;
}

.btn.danger {
  background: #F44336;
  color: white;
  border: none;
}

.btn.danger:hover {
  background: #e53935;
}

.confirmation-modal {
  background: white;
  border-radius: 10px;
  width: 450px;
  max-width: 90%;
  animation: fadeIn 0.3s;
}

.confirmation-modal .modal-header {
  border-bottom: none;
  justify-content: center;
}

.confirmation-modal .modal-body {
  text-align: center;
  padding: 2rem;
}

.confirmation-modal .modal-body p {
  margin: 0.5rem 0;
  color: #555;
}

.confirmation-modal .modal-footer {
  justify-content: center;
  border-top: none;
  padding-bottom: 2rem;
}


.sidebar-placeholder{
  margin-left: 50px;
}

@media screen and (max-width: 1200px) {
  .sidebar-placeholder {
    margin-left: 50px;
  }
  
 
  
}
/* Responsive adjustments */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .date-range {
    justify-content: space-between;
  }
  
  .date-range input {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
  
  .table-header, .table-row {
    flex-wrap: wrap;
  }
  
  .header-cell, .table-cell {
    flex: 0 0 50%;
    padding: 0.5rem;
  }
  
  .header-cell.actions, .table-cell.actions {
    flex: 0 0 100%;
    justify-content: flex-end;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>