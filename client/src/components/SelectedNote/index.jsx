import { useState, useRef, useCallback, useEffect } from "react";
import { FaSmile, FaImage } from "react-icons/fa";

import { useNote } from "hooks/useNote";
import { useNoteContext } from "hooks/useNoteContext";

import Editor from "../Editor";
import Modal from "components/Modal";
import EmojiPicker from "components/EmojiPicker";

import styles from "./index.module.scss";

const SelectedNote = () => {
  const { editSelectedNote, saveSelectedChanges, error } = useNote();
  const { selectedNote } = useNoteContext();

  const contentRef = useRef();
  const isFirstRender = useRef(true);

  const { id, title, emoji, content, coverImage } = selectedNote;

  const [showPicker, setShowPicker] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState(null); // State for new cover image

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

  const handleFormChange = useCallback((e) => {
    editSelectedNote(e.target.name, e.target.value);
  });

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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const timer = setTimeout(() => {
        saveSelectedChanges({
          id,
          title,
          emoji,
          content,
          coverImage: newCoverImage || coverImage,
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [title, emoji, content, newCoverImage, coverImage]); // Trigger save on changes

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
              onInput={handleFormChange}
              className={styles.title}
            />
          </div>
        </div>
        <div className={styles.body}>
          <Editor
            value={content}
            name="content"
            placeholder="Add note"
            onInput={handleFormChange}
            className={styles.content}
            ref={contentRef}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectedNote;
