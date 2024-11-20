import { useState } from 'react';
import axios from 'axios';

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const verifyEmail = async (token) => {
    try {
      setIsLoading(true);
      setError(null); // Reset any previous error
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/email/verify-email?token=${token}`
      );
      setSuccess(true);
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading, error, success };
};
