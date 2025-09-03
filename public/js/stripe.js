/* eslint-disable */

/* global axios, Stripe */
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51S1gqjLOs1NIp8ThQm5KGua2GxFbHFTZrWkUJurr2axu0cS189bXjR8NWGVbFiu8wHaYFxqBIjgBDui8Icj7Jw3u00CkZS7W5i',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    console.log(tourId);
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // console.log('Session ID:', session);

    // 2) Redirect user to checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error('⚠️ Booking failed:', err);
    showAlert('error', 'Something went wrong with booking. Please try again!');
  }
};
