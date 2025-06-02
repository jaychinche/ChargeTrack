<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <div class="main-content">
      <div class="content-header">
        <h2>Settings</h2>
        <div class="header-actions">
          <button class="btn btn-save">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
      
      <div class="settings-container">
        <div class="settings-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>
        
        <div class="settings-content">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="settings-section">
            <h3><i class="fas fa-cog"></i> General Settings</h3>
            
            <div class="form-group">
              <label>Application Name</label>
              <input type="text" v-model="settings.general.appName" class="form-control">
            </div>
            
            <div class="form-group">
              <label>Timezone</label>
              <select v-model="settings.general.timezone" class="form-control">
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time (EST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="GMT">GMT</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Default Currency</label>
              <select v-model="settings.general.currency" class="form-control">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Maintenance Mode</label>
              <div class="toggle-switch">
                <input type="checkbox" id="maintenance" v-model="settings.general.maintenanceMode">
                <label for="maintenance"></label>
                <span>{{ settings.general.maintenanceMode ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="settings-section">
            <h3><i class="fas fa-bell"></i> Notification Settings</h3>
            
            <div class="form-group">
              <label>Email Notifications</label>
              <div class="toggle-switch">
                <input type="checkbox" id="email-notifications" v-model="settings.notifications.emailEnabled">
                <label for="email-notifications"></label>
                <span>{{ settings.notifications.emailEnabled ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Admin Email</label>
              <input type="email" v-model="settings.notifications.adminEmail" class="form-control">
            </div>
            
            <div class="form-group">
              <label>Booking Confirmation</label>
              <div class="toggle-switch">
                <input type="checkbox" id="booking-confirm" v-model="settings.notifications.bookingConfirmation">
                <label for="booking-confirm"></label>
                <span>{{ settings.notifications.bookingConfirmation ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Low Balance Alert</label>
              <div class="toggle-switch">
                <input type="checkbox" id="balance-alert" v-model="settings.notifications.lowBalanceAlert">
                <label for="balance-alert"></label>
                <span>{{ settings.notifications.lowBalanceAlert ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Payment Settings -->
          <div v-if="activeTab === 'payments'" class="settings-section">
            <h3><i class="fas fa-credit-card"></i> Payment Settings</h3>
            
            <div class="form-group">
              <label>Payment Gateway</label>
              <select v-model="settings.payments.gateway" class="form-control">
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
            
            <div v-if="settings.payments.gateway === 'stripe'" class="gateway-settings">
              <div class="form-group">
                <label>Stripe Publishable Key</label>
                <input type="text" v-model="settings.payments.stripe.publishableKey" class="form-control">
              </div>
              
              <div class="form-group">
                <label>Stripe Secret Key</label>
                <input type="password" v-model="settings.payments.stripe.secretKey" class="form-control">
              </div>
            </div>
            
            <div v-if="settings.payments.gateway === 'paypal'" class="gateway-settings">
              <div class="form-group">
                <label>PayPal Client ID</label>
                <input type="text" v-model="settings.payments.paypal.clientId" class="form-control">
              </div>
              
              <div class="form-group">
                <label>PayPal Secret</label>
                <input type="password" v-model="settings.payments.paypal.secret" class="form-control">
              </div>
              
              <div class="form-group">
                <label>Sandbox Mode</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="sandbox-mode" v-model="settings.payments.paypal.sandbox">
                  <label for="sandbox-mode"></label>
                  <span>{{ settings.payments.paypal.sandbox ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Default Payment Method</label>
              <select v-model="settings.payments.defaultMethod" class="form-control">
                <option value="card">Credit/Debit Card</option>
                <option value="wallet">Wallet</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
          </div>
          
          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="settings-section">
            <h3><i class="fas fa-shield-alt"></i> Security Settings</h3>
            
            <div class="form-group">
              <label>Two-Factor Authentication</label>
              <div class="toggle-switch">
                <input type="checkbox" id="2fa" v-model="settings.security.twoFactorAuth">
                <label for="2fa"></label>
                <span>{{ settings.security.twoFactorAuth ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Password Policy</label>
              <select v-model="settings.security.passwordPolicy" class="form-control">
                <option value="low">Low (6+ characters)</option>
                <option value="medium">Medium (8+ characters with mix)</option>
                <option value="high">High (12+ characters with special chars)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Session Timeout</label>
              <select v-model="settings.security.sessionTimeout" class="form-control">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never (not recommended)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>IP Whitelisting</label>
              <textarea 
                v-model="settings.security.ipWhitelist" 
                class="form-control" 
                placeholder="Enter IP addresses, one per line"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '../user-componets/Sidebar.vue';

export default {
  name: 'AdminSettings',
  components: {
    AdminSidebar
  },
  data() {
    return {
      activeTab: 'general',
      tabs: [
        { id: 'general', label: 'General', icon: 'fas fa-cog' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
        { id: 'payments', label: 'Payments', icon: 'fas fa-credit-card' },
        { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' }
      ],
      settings: {
        general: {
          appName: 'ChargeTrack',
          timezone: 'UTC',
          currency: 'USD',
          maintenanceMode: false
        },
        notifications: {
          emailEnabled: true,
          adminEmail: 'admin@example.com',
          bookingConfirmation: true,
          lowBalanceAlert: true
        },
        payments: {
          gateway: 'stripe',
          defaultMethod: 'card',
          stripe: {
            publishableKey: 'pk_test_1234567890',
            secretKey: 'sk_test_1234567890'
          },
          paypal: {
            clientId: '',
            secret: '',
            sandbox: true
          }
        },
        security: {
          twoFactorAuth: false,
          passwordPolicy: 'medium',
          sessionTimeout: '30',
          ipWhitelist: ''
        }
      }
    };
  }
};
</script>

<style scoped>
/* Main Layout Styles */
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 30px;
  transition: margin-left 0.3s;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e6ed;
}

.content-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 15px;
}

/* Button Styles */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-save {
  background-color: #3498db;
  color: white;
}

.btn-save:hover {
  background-color: #2980b9;
}

/* Settings Container */
.settings-container {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.settings-tabs {
  width: 220px;
  background: #f8fafc;
  border-right: 1px solid #e0e6ed;
}

.tab-btn {
  width: 100%;
  padding: 15px 20px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-btn.active {
  background: #e0f2fe;
  color: #0369a1;
  border-left: 3px solid #0369a1;
}

.tab-btn i {
  width: 20px;
  text-align: center;
}

.settings-content {
  flex: 1;
  padding: 25px;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: border-color 0.3s;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-switch label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch label:after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle-switch input:checked + label {
  background-color: #3498db;
}

.toggle-switch input:checked + label:after {
  transform: translateX(26px);
}

.toggle-switch span {
  font-size: 14px;
  color: #64748b;
}

/* Gateway Specific Settings */
.gateway-settings {
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #e0e6ed;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-tabs {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e6ed;
    display: flex;
    overflow-x: auto;
  }
  
  .tab-btn {
    padding: 15px;
    border-left: none;
    border-bottom: 3px solid transparent;
    justify-content: center;
  }
  
  .tab-btn.active {
    border-left: none;
    border-bottom: 3px solid #0369a1;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 15px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>