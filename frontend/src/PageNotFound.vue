<template>
  <div class="not-found-page">
    <header class="header">
      <div class="header-content">
        <h1>&nbsp;&nbsp;&nbsp;ChargeTrack</h1>
        <p class="tagline">Smart EV Charging Management System</p>
      </div>
    </header>
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="action-buttons">
          <button @click="goHome" class="home-button">Go to Home</button>
          <button @click="goBack" class="back-button">Go Back</button>
        </div>
      </div>
      <div class="not-found-image">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
          <circle cx="400" cy="300" r="200" fill="#f3f3f3" />
          <circle cx="350" cy="250" r="10" fill="#333" />
          <circle cx="450" cy="250" r="10" fill="#333" />
          <path d="M350 350 Q400 400 450 350" stroke="#333" stroke-width="5" fill="none" />
          <path d="M300 200 L200 100" stroke="#003366" stroke-width="10" stroke-linecap="round" />
          <path d="M500 200 L600 100" stroke="#003366" stroke-width="10" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'NotFoundPage',
  setup() {
    const router = useRouter();

    const goHome = () => {
      router.push('/');
    };

    const goBack = () => {
      router.go(-1);
    };

    return {
      goHome,
      goBack
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

.not-found-page {
  background: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  height: 100vh;
  margin: -20px 0 50px;
}

.header {
  width: 100%;
  padding: 20px 0;
  position: absolute;
  top: 0;
  left: 0;
}

.header-content {
  text-align: left;
  padding-left: 20px;
}

.header h1 {
  color: #003366;
  font-size: 24px;
  margin: 0;
}

.tagline {
  color: #666;
  font-size: 14px;
  margin: 5px 0 0 0;
}

.not-found-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 800px;
  max-width: 90%;
  min-height: 400px;
  padding: 40px;
  margin-top: 60px;
}

.not-found-content {
  flex: 1;
  padding: 20px;
  text-align: center;
}

.not-found-content h1 {
  font-size: 120px;
  font-weight: 900;
  color: #003366;
  margin: 0;
  line-height: 1;
}

.not-found-content h2 {
  font-size: 32px;
  margin: 20px 0 10px;
  color: #333;
}

.not-found-content p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.not-found-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.not-found-image svg {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

button {
  border-radius: 20px;
  border: 1px solid #003366;
  background-color: #003366;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 30px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: pointer;
}

button:hover {
  background-color: #001a33;
  transform: translateY(-2px);
}

.home-button {
  background-color: #003366;
}

.back-button {
  background-color: transparent;
  color: #003366;
}

.back-button:hover {
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .not-found-container {
    flex-direction: column;
    padding: 20px;
  }

  .not-found-content h1 {
    font-size: 80px;
  }

  .not-found-content h2 {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .not-found-image {
    margin-top: 30px;
  }
}
</style>