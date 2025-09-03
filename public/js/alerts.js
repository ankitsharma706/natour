/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alerts');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  // console.log('About to show alert:', type, msg);
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
