// PopupMenu.jsx
import { forwardRef, React, useState } from "react";
import styles from "./index.module.scss"; // Create this file for styling

const PopupMenu = forwardRef(({ onSelect, position }, ref) => {
  return (
    <div>
      {/* <div className={styles.popupMenu}> */}
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: position.top + "px",
          left: position.left + "px",
        }}
        className={styles.popupMenu}
      >
        <ul>
          <li
            onClick={() => {
              onSelect("normal");
            }}
          >
            Normal Text Block
          </li>
          <li onClick={() => onSelect("image")}>Add Image</li>{" "}
          <li
            onClick={() => {
              onSelect("note");
            }}
          >
            Note Block
          </li>{" "}
          {/* This triggers the note creation */}
        </ul>
      </div>
    </div>
  );
});

export default PopupMenu;
