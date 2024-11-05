import { useState } from 'react';
import { useAuthContext } from 'hooks/useAuthContext';
import styles from './index.module.scss';

const ShareModal = ({ close }) => {
  const { user } = useAuthContext();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');

  const handleShare = () => {
    // Logic to handle the sharing
    console.log(`Sharing with ${email} with ${permission} permission.`);
    close();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Share</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.userInfo}>
          <img src={user.imageUrl} alt={user.name} className={styles.userImage} />
          <p>{`${user.name}'s Note App`}</p>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Invite Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className={styles.emailInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="permissions">Select Permission:</label>
          <select
            id="permissions"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className={styles.permissionSelect}
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
            <option value="comment">Comment</option>
            <option value="all">All</option>
          </select>
        </div>
        <button onClick={handleShare} className={styles.shareButton}>
          Share
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
