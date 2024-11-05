import { useState } from "react";
import {
  FaRegCommentAlt,
  FaRegClock,
  FaRegStar,
  FaStar,
  FaEllipsisH,
} from "react-icons/fa";
import moment from "moment";
import { useNote } from "hooks/useNote";
import Modal from "components/Modal";
import EditElementMenu from "components/EditElementMenu";
import ShareModal from "../ShareModal";
import formatDate from "utils/formatDate";
import styles from "./index.module.scss";
import User from "../../../../../../server/models/User";
import { useAuthContext } from "../../../../hooks/useAuthContext";

const Header = ({ selectedNote }) => {
  const { favoriteNote, unfavoriteNote } = useNote();
  const { user } = useAuthContext();
  const [editMenuPosition, setEditMenuPosition] = useState(null);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareModalPosition, setShareModalPosition] = useState(null);

  const handleToggleFavorite = async () => {
    if (selectedNote.isFavorite) {
      await unfavoriteNote(selectedNote.id);
    } else {
      await favoriteNote(selectedNote.id);
    }
  };

  const handleOpenEditModal = (e) => {
    e.preventDefault();
    const elementRect = e.currentTarget.getBoundingClientRect();
    const modalTop = elementRect.bottom + 4;
    const modalLeft = elementRect.left / 1.3;
    setEditMenuPosition({ top: modalTop, left: modalLeft });
    setShowEditMenu(true);
  };

  const handleOpenShareModal = (e) => {
    e.preventDefault();
    const elementRect = e.currentTarget.getBoundingClientRect();
    const modalTop = elementRect.bottom + 4;
    const modalLeft = Math.min(elementRect.left, window.innerWidth - 300);
    setShareModalPosition({ top: modalTop, left: modalLeft });
    setShowShareModal(true);
    // Log the selected note to ensure it's defined
    console.log("Opening share modal with note:", selectedNote);
  };
  return (
    <>
      {selectedNote && (
        <Modal
          show={showEditMenu}
          close={() => setShowEditMenu(false)}
          modalPosition={editMenuPosition}
          modalContainerClassName={styles.menu_container}
          modalClassName={styles.menu}
        >
          <EditElementMenu
            isSelected
            title={selectedNote.title}
            emoji={selectedNote.emoji ? selectedNote.emoji : `\u{1F5CB}`}
            closeMenu={() => setShowEditMenu(false)}
          />
        </Modal>
      )}

      {/* ShareModal Logic */}
      {showShareModal && (
        <Modal
          show={showShareModal}
          close={() => setShowShareModal(false)}
          modalPosition={shareModalPosition}
          modalContainerClassName={styles.share_modal_container}
          modalClassName={styles.share_modal}
          style={{
            top: `${shareModalPosition?.top}px`,
            left: `${shareModalPosition?.left}px`,
          }}
        >
          {/* Pass note details to ShareModal */}
          <ShareModal
            close={() => setShowShareModal(false)}
            noteId={selectedNote.id}
            noteTitle={selectedNote.title}
            noteContent={selectedNote.content}
          />
        </Modal>
      )}

      <header className={styles.header}>
        {selectedNote && (
          <div onClick={handleOpenEditModal} className={styles.title_wrapper}>
            <>
              <div className={styles.emoji}>
                {selectedNote.emoji || `\u{1F5CB}`}
              </div>
              <p className={styles.title}>
                {selectedNote.title.length > 0
                  ? selectedNote.title
                  : "Untitled"}
              </p>
            </>
          </div>
        )}
        <div className={styles.controls_wrapper}>
          <p className={styles.last_edit}>
            {selectedNote &&
              selectedNote.updatedAt &&
              formatDate(moment(selectedNote.updatedAt))}
          </p>
          <p onClick={handleOpenShareModal} className={styles.share}>
            Share
          </p>
          <div className={styles.icon_wrapper}>
            <FaRegCommentAlt />
          </div>
          <div className={styles.icon_wrapper}>
            <FaRegClock />
          </div>
          <div onClick={handleToggleFavorite} className={styles.icon_wrapper}>
            {!selectedNote && <FaRegStar />}
            {selectedNote && (
              <>
                {!selectedNote.isFavorite && <FaRegStar />}
                {selectedNote.isFavorite && <FaStar />}
              </>
            )}
          </div>
          <div className={styles.icon_wrapper}>
            <FaEllipsisH />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
