// import React from 'react';
// import EmailVerificationForm from '../../components/EmailVerificationForm';

// const EmailVerification = () => {
//     return <EmailVerificationForm />;
// };

// export default EmailVerification;
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerification = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError(true);
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/email/verify-email?token=${token}`
        );
        setMessage(response.data.message);
        setError(false);

        // Điều hướng đến trang đăng nhập sau vài giây
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setError(true);
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="email-verification">
      <h2>{error ? "Verification Failed" : "Verification Successful"}</h2>
      <p>{message}</p>
      {error ? (
        <p>Please try again or contact support if the issue persists.</p>
      ) : (
        <p>Redirecting to login page...</p>
      )}
    </div>
  );
};

export default EmailVerification;
