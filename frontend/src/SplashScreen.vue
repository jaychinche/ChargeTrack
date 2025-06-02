<template>
  <div class="auth-page splash-screen">
    <div class="splash-container">
      <!-- Animated Logo -->
      <div class="logo-animation">
        <svg class="logo-circle" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#003366" stroke-width="3" fill="none" />
          <path class="bolt" d="M50 20 L35 50 L50 45 L65 80 L50 55 L65 50 Z" fill="#003366" />
        </svg>
      </div>
      
      <h1 class="splash-title">ChargeTrack</h1>
      <p class="splash-subtitle">Powering the Future of Mobility</p>
      
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  setTimeout(() => {
    router.push('/login'); // Redirect to login after 3 seconds
  }, 5000);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
@import url('https://use.fontawesome.com/releases/v5.15.4/css/all.css');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-page {
  background: linear-gradient(135deg, #f6f5f7 0%, #e3e9f2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  height: 100vh;
  overflow: hidden;
}

.splash-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  padding: 40px;
}

.logo-animation {
  width: 150px;
  height: 150px;
  margin-bottom: 30px;
  position: relative;
}

.logo-circle {
  width: 100%;
  height: 100%;
  animation: pulse 2s infinite ease-in-out;
}

.bolt {
  transform-origin: 50% 50%;
  animation: boltFlash 1.5s infinite ease-in-out;
}

.splash-title {
  font-size: 48px;
  font-weight: bold;
  color: #003366;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 51, 102, 0.1);
  animation: fadeInUp 1s ease-out;
}

.splash-subtitle {
  font-size: 18px;
  color: #555;
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.loader {
  border: 6px solid rgba(0, 51, 102, 0.1);
  border-top: 6px solid #003366;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-top: 20px;
}

/* Keyframe Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

@keyframes boltFlash {
  0% { opacity: 0.8; fill: #003366; }
  50% { opacity: 1; fill: #0055aa; transform: scale(1.05); }
  100% { opacity: 0.8; fill: #003366; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .splash-title {
    font-size: 36px;
  }
  
  .splash-subtitle {
    font-size: 16px;
  }
  
  .logo-animation {
    width: 120px;
    height: 120px;
  }
}
</style>
