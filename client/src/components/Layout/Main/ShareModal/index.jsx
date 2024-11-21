import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "hooks/useAuthContext";
import styles from "./index.module.scss";

const ShareModal = ({ close, noteId, noteTitle, noteContent, token }) => {
  const { user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("View"); // Default permission value
  const emailInputRef = useRef(null);
  const [senderName, setSenderName] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]); // State for storing shared users
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("user", user);
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

    // Fetch the list of shared users for the current note
    const fetchSharedUsers = async () => {
      if (!noteId) return;
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${apiUrl}/api/notes/${noteId}/sharedUsers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token, // Change to x-auth-token
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text(); // Get error message from response
          throw new Error(`Failed to fetch shared users: ${errorText}`);
        }

        const data = await response.json();
        setSharedUsers(data.data); // Set shared users to state
      } catch (error) {
        console.error("Error fetching shared users:", error);
      }
    };

    fetchSharedUsers();
  }, [noteId, apiUrl, token]);

  const handleShare = async () => {
    const shareData = {
      noteId,
      noteTitle,
      email,
      senderName: user.name,
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
      const response = await fetch(`${apiUrl}/api/email/share`, {
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
  const handlePermissionChange = async (sharedUserId, newPermission) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/notes/${noteId}/changePermission`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            sharedUserId, // User to update
            permission: newPermission, // New permission
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to change permission: ${errorText}`);
      }

      const result = await response.json();
      console.log("Permission changed successfully:", result);
      // Optionally update sharedUsers state to reflect permission change
      setSharedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === sharedUserId
            ? { ...user, permission: newPermission }
            : user
        )
      );
    } catch (error) {
      console.error("Error changing permission:", error);
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
            <p>{`${user.name} (You)`}</p>
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

        {/* Display shared users under the logged-in user's name */}
        {sharedUsers.map((user) => (
          <div className={styles.userInfo} key={user.userId}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p>{`${user.name} (Guest)`}</p>
              <select
                id="permissions"
                value={user.permission}
                onChange={(e) =>
                  handlePermissionChange(user.userId, e.target.value)
                }
                className={styles.permissionSelect}
              >
                <option value="View">View</option>
                <option value="Edit">Edit</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareModal;
