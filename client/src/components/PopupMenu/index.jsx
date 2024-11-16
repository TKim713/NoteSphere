// PopupMenu.jsx
import { React, useState } from "react";
import styles from "./index.module.scss"; // Create this file for styling

const PopupMenu = ({ onSelect, position }) => {
  return (
    <div>
      {/* <div className={styles.popupMenu}> */}
      <div
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
};

export default PopupMenu;
