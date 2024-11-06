import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "hooks/useAuthContext";
import styles from "./index.module.scss";

const ShareModal = ({ close, noteId, noteTitle, noteContent, token }) => {
  const { user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("View"); // Default permission value
  const emailInputRef = useRef(null);
  const [senderName, setSenderName] = useState("");
  const {
    user: { name },
  } = useAuthContext();
  console.log("name", name)
  // Access the API URL from the environment variable
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Automatically focus the email input when the modal opens
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    // Log the note details for debugging
    console.log("Note ID:", noteId);
    console.log("Note Title:", noteTitle);
    console.log("Note Content:", noteContent);
    console.log("Token:", token);
  }, [noteId, noteTitle, noteContent, token]);

  const handleShare = async () => {
    const shareData = {
      noteId,
      noteTitle,
      email,
      senderName : name,
      permission,
    };

    // Log the share data to ensure it contains the correct information
    console.log("Share Data:", shareData);
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Change to x-auth-token
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error message from response
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const result = await response.json();
      console.log("Share successful:", result);
      // Optionally show success message or handle response
    } catch (error) {
      console.error("Error sharing note:", error);
      // Optionally show error message to the user
    } finally {
      close(); // Close the modal after sharing
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Share</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Invite Email:</label>
          <div className={styles.emailInputContainer}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className={styles.emailInput}
              ref={emailInputRef}
            />
            <button onClick={handleShare} className={styles.shareButton}>
              Share
            </button>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <p>{`${user.name}'s Note App`}</p>
            <select
              id="permissions"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className={styles.permissionSelect}
            >
              <option value="View">View</option>
              <option value="Edit">Edit</option>
              <option value="All">All</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
