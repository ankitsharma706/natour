import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    // if (res.data.status === 'success') {
    //   showAlert('success', `${type.toUpperCase()} updated successfully!`);
    //   setTimeout(() => location.reload(), 1500);
    // }
    // console.log(res);
    if (res.data.status.toLowerCase() === 'success') {
      console.log('✅ Profile updated successfully');

      // Update photo instantly without reload
      if (res.data.data.user.photo) {
        document.querySelector('.form__user-photo').src =
          `/img/users/${res.data.data.user.photo}?v=${Date.now()}`;
      }
    }
  } catch (err) {
    console.error('Update error:', err);
    showAlert(
      'error',
      err.response?.data?.message || 'Something went wrong while updating!',
    );
  }
};
