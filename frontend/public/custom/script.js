// DOM Elements
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const loginTitle = document.querySelector(".title-login");
const registerTitle = document.querySelector(".title-register");
const welcomeSection = document.querySelector(".welcome-section");
const userGreeting = document.getElementById("userGreeting");
const greetingName = document.getElementById("greetingName");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const logoutBtn = document.getElementById("logoutBtn");

// Form validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateUsername(username) {
  return username.length >= 3;
}

// Show error function
function showError(input, errorElement, message) {
  input.classList.add("error");
  input.classList.remove("success");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Show success function
function showSuccess(input, errorElement) {
  input.classList.remove("error");
  input.classList.add("success");
  errorElement.style.display = "none";
}

// Toggle between forms
function showRegisterForm() {
  // Animate welcome section
  welcomeSection.classList.add("slide-out");
  
  // Animate forms
  loginForm.classList.add("slide-out");
  registerForm.classList.add("slide-in");
  
  // Animate titles
  loginTitle.classList.add("active");
  registerTitle.classList.add("active");
  
  // Adjust wrapper height
  wrapper.style.height = "580px";
}

function showLoginForm() {
  // Animate welcome section back
  welcomeSection.classList.remove("slide-out");
  
  // Animate forms
  loginForm.classList.remove("slide-out");
  registerForm.classList.remove("slide-in");
  
  // Animate titles
  loginTitle.classList.remove("active");
  registerTitle.classList.remove("active");
  
  // Adjust wrapper height
  wrapper.style.height = "500px";
}

// Event listeners for form toggling
showRegister.addEventListener("click", function(e) {
  e.preventDefault();
  showRegisterForm();
});

showLogin.addEventListener("click", function(e) {
  e.preventDefault();
  showLoginForm();
});

// Login form validation
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const email = document.getElementById("log-email");
  const password = document.getElementById("log-pass");
  const emailError = document.getElementById("login-email-error");
  const passError = document.getElementById("login-pass-error");
  
  let isValid = true;
  
  // Validate email
  if (!validateEmail(email.value)) {
    showError(email, emailError, "Please enter a valid email");
    isValid = false;
  } else {
    showSuccess(email, emailError);
  }
  
  // Validate password
  if (!validatePassword(password.value)) {
    showError(password, passError, "Password must be at least 6 characters");
    isValid = false;
  } else {
    showSuccess(password, passError);
  }
  
  // If valid, simulate login
  if (isValid) {
    // In a real app, you would send this to your backend
    const username = email.value.split("@")[0];
    
    // Show greeting with username
    greetingName.textContent = `Welcome, ${username.charAt(0).toUpperCase() + username.slice(1)}!`;
    
    // Hide forms and show greeting
    loginForm.style.opacity = "0";
    loginForm.style.pointerEvents = "none";
    registerForm.style.opacity = "0";
    registerForm.style.pointerEvents = "none";
    userGreeting.classList.add("active");
    
    // Hide welcome section
    welcomeSection.style.opacity = "0";
    welcomeSection.style.pointerEvents = "none";
  }
});

// Register form validation
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const username = document.getElementById("reg-name");
  const email = document.getElementById("reg-email");
  const password = document.getElementById("reg-pass");
  const nameError = document.getElementById("reg-name-error");
  const emailError = document.getElementById("reg-email-error");
  const passError = document.getElementById("reg-pass-error");
  
  let isValid = true;
  
  // Validate username
  if (!validateUsername(username.value)) {
    showError(username, nameError, "Username must be 3+ characters");
    isValid = false;
  } else {
    showSuccess(username, nameError);
  }
  
  // Validate email
  if (!validateEmail(email.value)) {
    showError(email, emailError, "Please enter a valid email");
    isValid = false;
  } else {
    showSuccess(email, emailError);
  }
  
  // Validate password
  if (!validatePassword(password.value)) {
    showError(password, passError, "Password must be 6+ characters");
    isValid = false;
  } else {
    showSuccess(password, passError);
  }
  
  // If valid, simulate registration
  if (isValid) {
    // In a real app, you would send this to your backend
    // For demo purposes, we'll just show the login form
    showLoginForm();
    
    // Populate login form with registered credentials
    document.getElementById("log-email").value = email.value;
    document.getElementById("log-pass").value = password.value;
    
    // Show success message
    alert("Registration successful! Please login with your credentials.");
  }
});

// Logout functionality
logoutBtn.addEventListener("click", function() {
  // Hide greeting and show login form
  userGreeting.classList.remove("active");
  loginForm.style.opacity = "1";
  loginForm.style.pointerEvents = "all";
  
  // Show welcome section again
  welcomeSection.style.opacity = "1";
  welcomeSection.style.pointerEvents = "all";
  
  // Clear login form
  document.getElementById("loginForm").reset();
});

// Input validation on blur
document.getElementById("log-email").addEventListener("blur", function() {
  const email = this;
  const emailError = document.getElementById("login-email-error");
  
  if (!validateEmail(email.value)) {
    showError(email, emailError, "Please enter a valid email");
  } else {
    showSuccess(email, emailError);
  }
});

document.getElementById("log-pass").addEventListener("blur", function() {
  const password = this;
  const passError = document.getElementById("login-pass-error");
  
  if (!validatePassword(password.value)) {
    showError(password, passError, "Password must be at least 6 characters");
  } else {
    showSuccess(password, passError);
  }
});

document.getElementById("reg-name").addEventListener("blur", function() {
  const username = this;
  const nameError = document.getElementById("reg-name-error");
  
  if (!validateUsername(username.value)) {
    showError(username, nameError, "Username must be 3+ characters");
  } else {
    showSuccess(username, nameError);
  }
});

document.getElementById("reg-email").addEventListener("blur", function() {
  const email = this;
  const emailError = document.getElementById("reg-email-error");
  
  if (!validateEmail(email.value)) {
    showError(email, emailError, "Please enter a valid email");
  } else {
    showSuccess(email, emailError);
  }
});

document.getElementById("reg-pass").addEventListener("blur", function() {
  const password = this;
  const passError = document.getElementById("reg-pass-error");
  
  if (!validatePassword(password.value)) {
    showError(password, passError, "Password must be 6+ characters");
  } else {
    showSuccess(password, passError);
  }
});