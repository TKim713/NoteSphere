import { useState, useRef } from "react";

import { useNote } from "hooks/useNote";

import NavElement from "./NavElement";
import { AiOutlineEllipsis } from "react-icons/ai";
import { AiOutlineMore } from "react-icons/ai";

import styles from "./index.module.scss";

const NavDragContainer = ({ notes, selectedNote, containerType = null, isPageLoaded }) => {
  const {
    sortNormalNotes,
    sortFavoriteNotes,
    loadMoreNotes,
    hasMoreNotes,
    sortSharedNotes,
  } = useNote();
  const dragId = useRef(null);
  const dragStartingIndex = useRef(null);

  const [activeDragContainer, setActiveDragContainer] = useState(null);

  const [currentDragIndex, setCurrentDragIndex] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const handleLoadMore = async () => {
    await loadMoreNotes();
  };
  const handleDragStart = (e, index) => {
    setActiveDragContainer(containerType);

    const targetRect = e.currentTarget.getBoundingClientRect();
    const xOffset = e.clientX - targetRect.left;
    const yOffset = e.clientY - targetRect.top;

    e.dataTransfer.setDragImage(e.currentTarget, xOffset, yOffset);

    setCurrentDragIndex(index);
    dragStartingIndex.current = index;
    dragId.current = e.currentTarget.id;
  };

  const handleDrop = (e) => {
    if (dragStartingIndex !== currentDragIndex) {
      if (containerType === "shared") {
        sortSharedNotes(dragId.current, currentDragIndex);
      } else if (containerType === "favorite") {
        sortFavoriteNotes(dragId.current, currentDragIndex);
      } else {
        sortNormalNotes(dragId.current, currentDragIndex);
      }
    }
  };

  const handleDragStop = (e) => {
    setActiveDragContainer(null);
    dragStartingIndex.current = null;
    dragId.current = null;
    setCurrentDragIndex(null);
    setHighlightIndex(null);
  };

  return (
    <div
      onDrop={containerType === activeDragContainer ? handleDrop : undefined}
      className={styles.container}
    >
      {notes.map((note, index) => (
        <li
          id={note.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragStop}
          className={
            selectedNote && selectedNote.id === note.id
              ? styles.isSelected
              : undefined
          }
          key={note.id}
        >
          <div
            onDragEnter={() => {
              setCurrentDragIndex(index);
            }}
            onDragLeave={() => {
              setCurrentDragIndex(index);
            }}
          >
            <NavElement
              id={note.id}
              to={`/notes/${note.id}`}
              emoji={note.emoji}
              title={note.title}
              isFavorite={containerType === "favorite" || note.isFavorite}
              isShared={containerType === "shared" || note.isShared}
              ellipsisClassName={styles.ellipsis}
            />
          </div>
          {containerType === activeDragContainer &&
            index === currentDragIndex &&
            currentDragIndex !== dragStartingIndex.current && (
              <div
                className={styles.highlight_wrapper}
                onDragEnter={() => {
                  setHighlightIndex(index);
                }}
                onDragLeave={() => {
                  setHighlightIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                style={{
                  top: index < dragStartingIndex.current ? "-1.4rem" : "auto",
                  bottom:
                    index > dragStartingIndex.current ? "-1.4rem" : "auto",
                  opacity: highlightIndex === index ? 1 : 0,
                }}
              >
                <div className={styles.highlight} />
              </div>
            )}
        </li>
      ))}
      {containerType !== "favorite" &&
        containerType !== "shared" &&
        hasMoreNotes &&
        notes.length >= 10 && isPageLoaded && (
          <li className={styles.loadMoreItem} onClick={loadMoreNotes}>
            <div className={styles.icon}>
              <AiOutlineEllipsis />
            </div>
            <p>More</p>
          </li>
        )}
    </div>
  );
};

export default NavDragContainer;
