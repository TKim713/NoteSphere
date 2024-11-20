// components/Layout/Main/LoginModal/index.jsx
import React from 'react';
import styles from './index.module.scss';

const LoginModal = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {children}
        <button className={styles.modalButton} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
