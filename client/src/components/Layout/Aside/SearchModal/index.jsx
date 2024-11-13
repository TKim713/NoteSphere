import React, { useEffect } from "react";
import { useSearchNotes } from "hooks/useSearchNotes";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";

const SearchModal = () => {
  const { title, setTitle, notes, error, handleSearch } = useSearchNotes();
  const navigate = useNavigate();

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  // Automatically search as user types with debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (title) {
        handleSearch();
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [title]); // Run effect only when `title` changes

  return (
    <div className={styles.container}>
      <div className={styles.search_box}>
        <input
          type="text"
          placeholder="Search notes by title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.search_input}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.list}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <li key={note.id} className={styles.note_item}>
              <h3
                className={styles.note_title}
                onClick={() => handleNoteClick(note.id)}
              >
                {note.title}
              </h3>
            </li>
          ))
        ) : (
          <p className={styles.no_notes}>No notes found.</p> // Message when no notes found
        )}
      </ul>
    </div>
  );
};

export default SearchModal;
