import { useState, useRef, useCallback, useEffect } from "react";
import { FaSmile, FaImage } from "react-icons/fa";

import { useNote } from "hooks/useNote";
import { useNoteContext } from "hooks/useNoteContext";

import Editor from "../Editor";
import Modal from "components/Modal";
import EmojiPicker from "components/EmojiPicker";

import styles from "./index.module.scss";

import PopupMenu from 'components/PopupMenu';

const SelectedNote = () => {
  const { editSelectedNote, saveSelectedChanges, createNote } = useNote();
  const { selectedNote } = useNoteContext();

  const contentRef = useRef();
  const isFirstRender = useRef(true);

  //const { id, title, emoji, content, coverImage } = selectedNote;
  const { id, title, emoji, content = '', coverImage } = selectedNote || {}; // Handle undefined selectedNote

  // Initialize content as an array of blocks
  // const [contentBlocks, setContentBlocks] = useState(
  //   typeof content === 'string' ? content.split('\n') : ['']
  // );

  const [contentBlocks, setContentBlocks] = useState(
    Array.isArray(content) ? content : [''] // Check if content is an array
  );
  

  const [showPicker, setShowPicker] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState(null); // State for new cover image
  const [showPopup, setShowPopup] = useState({ show: false, index: null }); // State for the popup menu
  const [blockType, setBlockType] = useState('normal'); // Default to normal block

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
    editSelectedNote('title', e.target.value); // Update title in state
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoverImage(reader.result); // Set the new cover image as base64
        editSelectedNote("coverImage", reader.result); // Update selected note with new cover image
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleFormChange = useCallback((e, index) => {
  //   const newContentBlocks = [...contentBlocks];
  //   newContentBlocks[index] = e.target.value; // Update the specific block
  //   setContentBlocks(newContentBlocks);
    
  //   if (e.target.name == 'content') {
  //     editSelectedNote(e.target.name, newContentBlocks.join('\n')); // Join blocks into content string
  //   }

  //   editSelectedNote(e.target.name, e.target.value); // Join blocks into content string
  // }, [contentBlocks]);
  const handleFormChange = useCallback((e, index) => {
    const newContentBlocks = [...contentBlocks];
    newContentBlocks[index] = e.target.value; // Update the specific block
    setContentBlocks(newContentBlocks);
    
    // Update selected note content as an array
    editSelectedNote('content', newContentBlocks); // Save the updated blocks as an array
  }, [contentBlocks]);

  //const handleFormChange = useCallback((e) => {
   // editSelectedNote(e.target.name, e.target.value);
//     });

  // Add a new block based on selected type
  const addNewBlock = (index) => {
    const newBlocks = [...contentBlocks];
    newBlocks.splice(index + 1, 0, blockType === 'normal' ? '' : ''); // Add an empty block
    setContentBlocks(newBlocks);
    setShowPopup({ show: false, index: null }); // Close the popup after adding a block
  };

  const handleAddBlockClick = (index) => {
    setShowPopup({ show: true, index });
  };

  const handleSelect = (type, index) => {
    if (type === 'normal') {
      addNewBlock(index); // Adds a block at the correct index
    } else if (type === 'note') {
      createNewNote(); // Create a new note when "Note Block" is selected
    }
    // Close the popup after selecting an option
    setShowPopup({ show: false, index: null });
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
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [title, emoji, contentBlocks, newCoverImage, coverImage]); // Trigger save on changes

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
          </div>
        ) : null}
        <div className={styles.header}>
          <div onClick={() => setShowPicker(true)} className={styles.emoji_wrapper}>
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
              <button onClick={() => handleAddBlockClick(index)} className={styles.addButton}>+</button>
              <Editor
                value={block}
                name={`content-block-${index}`}
                placeholder="Add note"
                onInput={(e) => handleFormChange(e, index)} // Handle content block change
                className={styles.content}
                ref={index === 0 ? contentRef : null}
              />
              {showPopup.show && showPopup.index === index && (
                <PopupMenu onSelect={(type) => handleSelect(type, index)} /> // Show PopupMenu for the correct block
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedNote;
