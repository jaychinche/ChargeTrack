<template>
  <div class="auth-page">
    <header class="header">
      <div class="header-content">
        <h1 class ="title">&nbsp;&nbsp;&nbsp;ChargeTrack</h1>
        <p class="tagline">Smart EV Charging Management System</p>
      </div>
    </header>
    <div :class="['container', { 'right-panel-active': isSignUp }]">

      <!-- Success Alert -->
      <div v-if="showSuccessAlert" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Sign Up Form -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleSignUp">
          <h1>Create Account</h1>
          <!-- <div class="social-container">
            <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
            <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
          </div> -->
          <span>or use your email for registration</span>
          <input type="text" placeholder="Username" v-model="signUpData.username" required />
          <input type="email" placeholder="Email" v-model="signUpData.email" required />
          <input type="password" placeholder="Password" v-model="signUpData.password" required />
          <select v-model="signUpData.role" required>
            <option value="" disabled selected>Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <p class="text-center">Already have an account? <a href="#" @click="isSignUp = false">Sign In</a></p>
          <p v-if="error" class="error-message">{{ error }}</p>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Processing...' : 'Sign Up' }}
          </button>
         
          
        </form>
      </div>

      <div class="form-container sign-in-container">
        <form @submit.prevent="handleSignIn">
          <h1>Sign in</h1>
          <div class="social-container">
            <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
            <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
          </div>
          <span>or use your account</span>
          <input type="email" placeholder="Email" v-model="signInData.email" required />
          <input type="password" placeholder="Password" v-model="signInData.password" required />
          <a href="#">Forgot your password?</a>
          <p class="text-center">Don't have an account? <a href="#" @click="isSignUp = true">Sign Up</a></p>
          <p v-if="error" class="error-message">{{ error }}</p>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
          
        </form>
      </div>

      <!-- Overlay Panels -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>Welcome Back to ChargeTrack!</h1>
            <p>Log in with your personal details to continue tracking and managing your EV charging sessions.</p>
            <button class="ghost" @click="isSignUp = false">Sign In</button>
             
          </div>
          <div class="overlay-panel overlay-right">
            <h1>Hello and Welcome to ChargeTrack!</h1>
            <p>Join us by entering your details and start your smart EV charging journey today</p>
            <button class="ghost" @click="isSignUp = true">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BASE_URL from '../src/config/baseURL'; 

export default {
  name: 'AuthForm',
  setup() {
    const router = useRouter();
    const isSignUp = ref(false);
    const loading = ref(false);
    const error = ref('');
    const showSuccessAlert = ref(false);
    const successMessage = ref('');

    const signInData = ref({
      email: 'chinchejay@gmail.com',
      password: '123456'
    });

    const signUpData = ref({
      username: '',
      email: '',
      password: '',
      role: '',
    });

    const showAlert = (message) => {
      successMessage.value = message;
      showSuccessAlert.value = true;
      setTimeout(() => {
        showSuccessAlert.value = false;
      }, 3000);
    };

 const handleSignIn = async () => {
  error.value = '';
  if (!signInData.value.email || !signInData.value.password) {
    error.value = 'Please enter email and password.';
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signInData.value.email,
        password: signInData.value.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Save the token and user data to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showAlert('Login successful! Redirecting...');
      
      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin-dashboard');
        } else {
          router.push('/user-dashboard');
        }
      }, 1500);
    } else {
      error.value = data.error || data.message || 'Login failed. Please try again.';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'Server error. Please try again later.';
  } finally {
    loading.value = false;
  }
};

    const handleSignUp = async () => {
      error.value = '';

      if (!signUpData.value.username || !signUpData.value.email ||
        !signUpData.value.password || !signUpData.value.role) {
        error.value = 'Please fill in all fields.';
        return;
      }

      loading.value = true;

      try {
        const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signUpData.value),
        });

        let result = {};
        try {
          result = await response.json();
        } catch {
          result = {};
        }

        if (response.ok && result.success) {
          showAlert('Registered successfully! Please sign in.');
          isSignUp.value = false; // Switch to login form
          // Clear form
          signUpData.value = {
            username: '',
            email: '',
            password: '',
            role: '',
          };
        } else {
          error.value = result.error || `Registration failed with status ${response.status}`;
        }
      } catch (err) {
        console.error(err);
        error.value = 'Server error. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    return {
      isSignUp,
      signInData,
      signUpData,
      handleSignIn,
      handleSignUp,
      loading,
      error,
      showSuccessAlert,
      successMessage
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
@import url('https://use.fontawesome.com/releases/v5.15.4/css/all.css');

* {
  box-sizing: border-box;
}

.auth-page {
  background: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2rem;
  color: #003366;
}

.tagline {
  color: #666;
  font-size: 1rem;
}

h1 {
  font-weight: bold;
  margin: 0;
  font-size: 1.5rem;
}

h2 {
  text-align: center;
}

p {
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: 12px;
}

a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}

button {
  border-radius: 20px;
  border: 1px solid #003366;
  background-color: #003366;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  cursor: not-allowed;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: #FFFFFF;
}

form {
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  height: 100%;
  text-align: center;
}

input,
select {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
}

.error-message {
  color: #ff0000;
  font-size: 14px;
  margin: 10px 0;
}

.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%, 49.99% {
    opacity: 0;
    z-index: 1;
  }
  50%, 100% {
    opacity: 1;
    z-index: 5;
  }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: linear-gradient(to right, #003366, #001a33);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #FFFFFF;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 30px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.social-container {
  margin: 20px 0;
}

.social-container a {
  border: 1px solid #DDDDDD;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 1000;
  animation: slideIn 0.5s, fadeOut 0.5s 2.5s forwards;
}

.alert-success {
  background-color: #53b46a;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    min-height: 600px;
  }

  .form-container {
    width: 100%;
  }

  .sign-in-container {
    transform: translateX(0);
  }

  .container.right-panel-active .sign-in-container {
    transform: translateX(100%);
  }

  .sign-up-container {
    left: 0;
    transform: translateX(100%);
  }

  .container.right-panel-active .sign-up-container {
    transform: translateX(0);
  }

  .overlay-container {
    display: none;
  }

  form {
    padding: 0 20px;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .tagline {
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 600px) {
  .title{
    font-size: 76px;
  }
  
}

@media (max-width: 480px) {
  .container {
    min-height: 500px;
  }

  button {
    padding: 10px 35px;
    font-size: 11px;
  }

  form {
    padding: 0 15px;
  }

  input, select {
    padding: 10px 12px;
  }

  .header h1 {
    font-size: 1.3rem;
  }

  .tagline {
    font-size: 0.8rem;
  }
}

 
</style>
