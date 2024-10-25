// PopupMenu.jsx
import { React, useState } from 'react';
import styles from './index.module.scss'; // Create this file for styling

const PopupMenu = ({ onSelect }) => {

  return (
    <div>
      <div className={styles.popupMenu}>
        <ul>
          <li onClick={() => { onSelect('normal')}}>Normal Text Block</li>
          <li onClick={() => { onSelect('note')}}>Note Block</li> {/* This triggers the note creation */}
        </ul>
      </div>
    </div>
  );
};


export default PopupMenu;
