import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleRight, FaPlus } from "react-icons/fa";
import { AiOutlineEllipsis } from "react-icons/ai";
import { useNoteContext } from "hooks/useNoteContext";
import { useNote } from "hooks/useNote";

import NavDragContainer from "./NavDragContainer";

import styles from "./index.module.scss";

const Nav = () => {
  const navigate = useNavigate();
  const {
    notes = [],
    favoriteNotes = [],
    sharedNotes = [],
    selectedNote,
  } = useNoteContext();
  const { createNote, loadMoreNotes, hasMoreNotes } = useNote();

  console.log("favor", favoriteNotes);
  console.log("shared", sharedNotes);
  const [showShared, setShowShared] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [needToNavigate, setNeedToNavigate] = useState(false);

  // Add a new note
  const handleAddNote = async (e) => {
    await createNote();
    setShowNotes(true);
    setNeedToNavigate(true);
  };
  // Load more notes when "Load More" button is clicked
  // const handleLoadMore = async () => {
  //   await loadMoreNotes();
  // };

  // Handle automatic navigation when a note is created
  useEffect(() => {
    if (needToNavigate && notes.length > 0) {
      navigate(`/notes/${notes[0].id}`);
      setNeedToNavigate(false);
    }
  }, [needToNavigate, notes, navigate]);

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {/* If no notes, show the 'Add Note' option */}
        {notes.length === 0 && (
          <div className={styles.list}>
            <div onClick={handleAddNote} className={styles.list_header}>
              <div
                className={`${styles.icon_wrapper} ${
                  showFavorites ? styles.icon_open : undefined
                }`}
              >
                <FaPlus size={"1.3rem"} />
              </div>
              <p>Add Note</p>
            </div>
          </div>
        )}

        {sharedNotes.length > 0 && (
          <ul className={styles.list}>
            <div
              onClick={() => setShowShared((prevState) => !prevState)}
              className={styles.list_header}
            >
              <div
                className={`${styles.icon_wrapper} ${
                  showShared ? styles.icon_open : undefined
                }`}
              >
                <FaAngleRight />
              </div>
              <p>Share Notes:</p>
            </div>
            {showShared && (
              <NavDragContainer
                containerType="shared"
                notes={sharedNotes}
                selectedNote={selectedNote}
              />
            )}
          </ul>
        )}
        {/* If there are favorite notes, show them */}
        {favoriteNotes.length > 0 && (
          <ul className={styles.list}>
            <div
              onClick={() => setShowFavorites((prevState) => !prevState)}
              className={styles.list_header}
            >
              <div
                className={`${styles.icon_wrapper} ${
                  showFavorites ? styles.icon_open : undefined
                }`}
              >
                <FaAngleRight />
              </div>
              <p>Favorite Notes:</p>
            </div>
            {showFavorites && (
              <NavDragContainer
                containerType="favorite"
                notes={favoriteNotes}
                selectedNote={selectedNote}
              />
            )}
          </ul>
        )}

        {/* If there are normal notes, show them */}
        {notes.length > 0 && (
          <ul className={styles.list}>
            <div
              onClick={() => setShowNotes((prevState) => !prevState)}
              className={styles.list_header}
            >
              <div
                className={`${styles.icon_wrapper} ${
                  showNotes ? styles.icon_open : undefined
                }`}
              >
                <FaAngleRight />
              </div>
              <p>Notes:</p>
            </div>
            {showNotes && (
              <>
                <NavDragContainer
                  containerType="normal"
                  notes={notes}
                  selectedNote={selectedNote}
                />
                {/* Load More Button */}
                {/* {hasMoreNotes && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      onClick={handleLoadMore}
                      className={styles.loadMoreButton}
                    >
                      <AiOutlineEllipsis />
                      More
                    </button>
                  </div>
                )} */}
              </>
            )}
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Nav;
