/* eslint-disable */

// import axios from 'axios';

// Make them globals
function hideAlert() {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

function showAlert(type, msg) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
}

// Login function
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
      withCredentials: true,
    });

    // console.log('Response:', res);
    if (res.data.status.toLowerCase() === 'success') {
      showAlert('success', 'Logged in Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Login failed. Please try again.');
    }
  } catch (err) {
    console.error('Axios full error:', err);
    console.error('Axios response:', err.response);
    showAlert(
      'error',
      err.response?.data?.message ||
        err.message ||
        'An error occurred while logging in.',
    );
  }
};

// Attach event listener to form
const loginForm = document.querySelector('.form--login');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showAlert('error', 'Please enter both email and password.');
      return;
    }

    login(email, password);
  });
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
      withCredentials: true, // ✅ keep this
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error('Logout error:', err);
    showAlert('error', 'Error logging out! Please try again.');
  }
};
