import { useState, useRef, useCallback, useEffect } from "react";
import { FaSmile, FaImage } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { useNote } from "hooks/useNote";
import { useNoteContext } from "hooks/useNoteContext";

import Editor from "../Editor";
import Modal from "components/Modal";
import EmojiPicker from "components/EmojiPicker";

import styles from "./index.module.scss";

import PopupMenu from "components/PopupMenu";

const SelectedNote = () => {
  const { editSelectedNote, saveSelectedChanges, createNote } = useNote();
  const { selectedNote } = useNoteContext();
  const contentRef = useRef();
  const popupRef = useRef();
  const isFirstRender = useRef(true);

  //const { id, title, emoji, content, coverImage } = selectedNote;
  const { id, title, emoji, content = "", coverImage } = selectedNote || {}; // Handle undefined selectedNote

  // Initialize content as an array of blocks
  // const [contentBlocks, setContentBlocks] = useState(
  //   typeof content === 'string' ? content.split('\n') : ['']
  // );

  const [contentBlocks, setContentBlocks] = useState(
    Array.isArray(content) ? content : [""] // Check if content is an array
  );
  console.log("contentBlocks", contentBlocks);

  const [showPicker, setShowPicker] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState(null); // State for new cover image
  const [showPopup, setShowPopup] = useState({
    show: false,
    index: null,
    position: { top: 0, left: 0 },
  });
  const [blockType, setBlockType] = useState("normal"); // Default to normal block
  const [imageBlockIndex, setImageBlockIndex] = useState(null);

  const handleEmojiSelect = (e) => {
    editSelectedNote("emoji", e.native);
    setShowPicker(false);
  };

  const handleKeyDown = (e, name) => {
    if (name === "title") {
      if (e.key === "Enter") {
        e.preventDefault();
        contentRef.current.focus();
      }
    }
  };

  const handleTitleChange = (e) => {
    editSelectedNote("title", e.target.value); // Update title in state
  };
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverImage(URL.createObjectURL(file)); // Display the image immediately using URL.createObjectURL
      saveSelectedChanges({
        id,
        title,
        emoji,
        content: contentBlocks,
        coverImage: file, // Use the new file directly for upload
      });
    }
  };

  const handleFormChange = useCallback(
    (e, index) => {
      const newContentBlocks = [...contentBlocks];
      const newValue = e.target.value;

      // Cập nhật block với type và value
      newContentBlocks[index] = { type: "text", value: newValue };

      // Cập nhật state với contentBlocks mới
      setContentBlocks(newContentBlocks);

      // Cập nhật nội dung vào state
      editSelectedNote("content", newContentBlocks);

      // Gửi dữ liệu (cả type và value) qua API
      if (newContentBlocks[index].type === "text") {
        const token = localStorage.getItem("token");

        fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token, // Thêm token nếu cần
          },
          body: JSON.stringify({
            content: newContentBlocks, // Gửi cả type và value
          }),
        })
          .then((response) => response.json())
          .then((data) => console.log("Text block saved:", data))
          .catch((error) => console.error("Error saving text block:", error));
      }
    },
    [contentBlocks]
  );

  const addNewBlock = (index) => {
    const newBlocks = [...contentBlocks];
    newBlocks.splice(index + 1, 0, { type: "text", value: "" }); // Default to text block
    setContentBlocks(newBlocks);
  };

  // const handleAddBlockClick = (index, event) => {
  //   const { top, left, height } = event.target.getBoundingClientRect(); // Get button position
  //   setShowPopup({
  //     show: true,
  //     index,
  //     position: { top: top + height, left }, // Position popup below the button
  //   });
  // };
  const handleAddBlockClick = (index, event) => {
    const { top, left, height } = event.target.getBoundingClientRect(); // Lấy vị trí của nút
    const viewportHeight = window.innerHeight; // Chiều cao của viewport
    const isNearBottom = top + height + 100 > viewportHeight; // Kiểm tra nếu gần cuối trang (100 là chiều cao ước lượng của PopupMenu)
  
    setShowPopup({
      show: true,
      index,
      position: {
        top: isNearBottom ? top - height - 100 : top + height, // Hiển thị phía trên nếu gần cuối trang
        left,
      },
    });
  };
  
  const deleteBlock = (index) => {
    // Create a new array without the deleted block
    const updatedContentBlocks = contentBlocks.filter((_, i) => i !== index);
    
    // Update the state
    setContentBlocks(updatedContentBlocks);
    
    // Update the backend
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
        content: updatedContentBlocks, // Send the updated content blocks
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Block deleted:", data))
      .catch((error) => console.error("Error deleting block:", error));
  };  

  const handleSelect = (type, index) => {
    if (type === "normal") {
      addNewBlock(index); // Adds a block at the correct index
    } else if (type === "note") {
      createNewNote(); // Create a new note when "Note Block" is selected
    } else if (type === "image") {
      setImageBlockIndex(index); // Set the index of the block where the image will go
      document.getElementById("imageInput").click(); // Trigger file input click
    } else if (type === "delete") {
      deleteBlock(index); // Trigger file input click
    }
    // Close the popup after selecting an option
    setShowPopup({ show: false, index: null, position: { top: 0, left: 0 } });
  };

  // Function to create a new note
  const createNewNote = async () => {
    try {
      // Call createNote from useNote
      await createNote(); // This function will handle creating a new note
      // Optionally, you can fetch or refresh notes here if needed
    } catch (error) {
      console.error("Error creating new note:", error);
      // Handle the error appropriately (e.g., show a notification)
    }
  };
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && imageBlockIndex !== null) {
      // Step 1: Add a temporary block for the local image preview
      const newContentBlocks = [...contentBlocks];
      const tempImageUrl = URL.createObjectURL(file);
  
      // Add a temporary block to display the image
      newContentBlocks.splice(imageBlockIndex + 1, 0, { type: "image", value: tempImageUrl });
      setContentBlocks(newContentBlocks);
      setImageBlockIndex(null); // Reset imageBlockIndex
  
      // Step 2: Start the upload to Cloudinary
      const formData = new FormData();
      formData.append("contentImage", file);
  
      const token = localStorage.getItem("token"); // Fetch the auth token
  
      fetch(`http://localhost:8080/api/notes/${id}/uploadContentImage`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // Step 3: Replace the temporary local URL with the encrypted Cloudinary URL
          const updatedContentBlocks = [...contentBlocks];
          const indexToUpdate = updatedContentBlocks.findIndex(
            (block) => block.value === tempImageUrl
          );
          if (indexToUpdate !== -1) {
            updatedContentBlocks[indexToUpdate] = { type: "image", value: data.secure_url }; // Use the BE's returned URL
            setContentBlocks(updatedContentBlocks);
          }
        })
        .catch((error) => console.error("Error uploading image:", error));
    }
  };  
  
  // Show popup for the specific block where "+" was clicked
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const timer = setTimeout(() => {
        saveSelectedChanges({
          id,
          title,
          emoji,
          content: contentBlocks, // Join blocks into content string
          coverImage: newCoverImage || coverImage,
        });
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [title, emoji, contentBlocks, newCoverImage, coverImage]); // Trigger save on changes
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup({
          show: false,
          index: null,
          position: { top: 0, left: 0 },
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const headerPadding =
    newCoverImage || coverImage ? "0 10rem 0" : "5rem 10rem 0";
  return (
    <div className={styles.container}>
      <div className={styles.note}>
        {newCoverImage || coverImage ? (
          <div className={styles.coverImage}>
            <img
              src={newCoverImage || coverImage}
              alt="Cover"
              className={styles.coverImg}
            />
            <label
              htmlFor="coverImageInput"
              className={styles.changeCoverLabel}
            >
              <FaImage /> Change Cover
              <input
                type="file"
                id="coverImageInput"
                onChange={handleCoverImageChange}
                style={{ display: "none" }}
                accept="image/*"
              />
            </label>
          </div>
        ) : null}
        <div
          className={`${styles.header} ${
            coverImage ? styles.withCoverImage : ""
          }`}
          style={{ padding: headerPadding }}
        >
          <div
            onClick={() => setShowPicker(true)}
            className={styles.emoji_wrapper}
          >
            <div className={styles.emoji}>{emoji}</div>
          </div>
          <div className={styles.header_content}>
            <Modal
              local
              show={showPicker}
              close={() => setShowPicker(false)}
              modalClassName={styles.picker}
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} theme="dark" />
            </Modal>
            <ul className={styles.controls}>
              {!emoji && (
                <li onClick={() => setShowPicker(true)}>
                  <FaSmile /> Add Emoji
                </li>
              )}
              {!newCoverImage && !coverImage && (
                <li>
                  <label htmlFor="coverImageInput">
                    <FaImage /> Add Cover
                  </label>
                  <input
                    type="file"
                    id="coverImageInput"
                    onChange={handleCoverImageChange}
                    style={{ display: "none" }} // Hide the input field
                    accept="image/*"
                  />
                </li>
              )}
            </ul>
            <Editor
              isTitle
              value={title}
              name="title"
              placeholder="Untitled"
              onKeyDown={handleKeyDown}
              onInput={handleTitleChange}
              className={styles.title}
            />
          </div>
        </div>
        <div className={styles.body}>
          {contentBlocks.map((block, index) => (
            <div key={index} className={styles.blockContainer}>
              <button
                onClick={() => handleAddBlockClick(index, event)}
                className={styles.addButton}
              >
                <IoIosAdd />
              </button>
              {block.type === "image" ? (
                <img
                  src={block.value}
                  alt="Uploaded Image"
                  className={styles.imageBlock}
                />
              ) : (
                <Editor
                  value={block.value}
                  name={`content-block-${index}`}
                  placeholder="Add note"
                  onInput={(e) => handleFormChange(e, index)}
                  className={styles.content}
                  ref={index === 0 ? contentRef : null}
                />
              )}
              {showPopup.show && showPopup.index === index && (
                <PopupMenu
                  ref={popupRef}
                  onSelect={(type) => handleSelect(type, index)}
                  position={showPopup.position}
                /> // Show PopupMenu for the correct block
              )}
            </div>
          ))}
        </div>
        <input
          type="file"
          id="imageInput"
          onChange={handleImageSelect}
          style={{ display: "none" }}
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default SelectedNote;
