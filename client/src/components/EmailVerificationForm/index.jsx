import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEmail } from '../../hooks/useEmail';

const EmailVerificationForm = () => {

  const { token } = useParams(); // Get token from URL params
  const { verifyEmail, isLoading, error, success } = useEmail();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  return (
    <div className="email-verification-page">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>
          <h2>Email Verification Failed</h2>
          <p>Error: {error}</p>
        </div>
      ) : success ? (
        <div>
          <h2>Email Verification Successful</h2>
          <p>Your email has been successfully verified. You can now proceed to log in.</p>
        </div>
      ) : null}
    </div>
  );
};

export default EmailVerificationForm;