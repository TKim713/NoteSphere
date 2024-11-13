import NoteDao from "../daos/note/index.js";
import NoteListDao from "../daos/noteList/index.js";
import CustomError from "../models/CustomError.js";

const checkForExistingNoteAndPermission = async (userId, noteId) => {
  const existingNote = await NoteDao.fetchNoteById(noteId);

  if (!existingNote) {
    throw new CustomError("A note with that id does not exist.", 404);
  }

  if (existingNote.userId.toString() !== userId) {
    throw new CustomError("Not authorized to access this resource.", 403);
  }

  return existingNote;
};

// export const fetchUserNotes = async (userId) => {
//   const notes = await NoteListDao.fetchUserNotes(userId);

//   for (let i = 0; i < notes.normalListOrder.length; i++) {
//     notes.normalListOrder[i].isFavorite = notes.favoriteListOrder.some(
//       (favoriteNote) => favoriteNote.id === notes.normalListOrder[i].id
//     );
//   }

//   for (let i = 0; i < notes.sharedListOrder.length; i++) {
//     notes.sharedListOrder[i].isShared = true;
//   }

//   return notes;
// };
export const fetchUserNotes = async (userId) => {
  const notes = await NoteListDao.fetchUserNotes(userId);

  // Ensure 'normalListOrder', 'favoriteListOrder', and 'sharedListOrder' are arrays
  const normalListOrder = notes.normalListOrder || [];
  const favoriteListOrder = notes.favoriteListOrder || [];
  const sharedListOrder = notes.sharedListOrder || [];

  for (let i = 0; i < normalListOrder.length; i++) {
    normalListOrder[i].isFavorite = favoriteListOrder.some(
      (favoriteNote) => favoriteNote.id === normalListOrder[i].id
    );
  }

  for (let i = 0; i < sharedListOrder.length; i++) {
    sharedListOrder[i].isShared = true;
  }

  return { ...notes, normalListOrder, favoriteListOrder, sharedListOrder };
};

export const fetchNoteContent = async (userId, noteId) => {
  const note = await NoteDao.fetchNoteContentById(noteId);

  if (!note) {
    throw new CustomError("A note with that id does not exist.", 404);
  }

  if (note.userId.toString() !== userId) {
    throw new CustomError("Not authorized to access this resource.", 403);
  }

  return { content: note.content };
};

export const addNote = async ({
  userId,
  noteId,
  title = "",
  emoji = "",
  content = "",
}) => {
  const newNote = {
    id: noteId,
    userId,
    title,
    emoji,
    content,
    // isFavorite: false,
  };

  return await NoteDao.createNote(newNote);
};

export const duplicateNote = async ({
  userId,
  existingNoteId,
  newNoteId,
  noteDetails,
}) => {
  const { content } = await fetchNoteContent(userId, existingNoteId);

  return await NoteDao.createDuplicate({
    existingNoteId,
    userId,
    id: newNoteId,
    content,
    ...noteDetails,
  });
};

export const saveChangesToNote = async (userId, noteId, noteDetails, file) => {
  await checkForExistingNoteAndPermission(userId, noteId);
  let coverImageUrl = null;
  if (file) {
    const uploadResult = await NoteDao.uploadImageToCloudinary(file);
    coverImageUrl = uploadResult.secure_url;
  }

  const updatedNoteDetails = coverImageUrl
    ? { ...noteDetails, coverImage: coverImageUrl }
    : { ...noteDetails };
  return await NoteDao.updateNote(noteId, updatedNoteDetails);
};

export const favoriteNote = async (userId, noteId) => {
  return await NoteListDao.favoriteNote(userId, noteId);
};

export const unfavoriteNote = async (userId, noteId) => {
  return await NoteListDao.unfavoriteNote(userId, noteId);
};

export const removeNote = async (userId, noteId) => {
  await checkForExistingNoteAndPermission(userId, noteId);

  const deletedNote = await NoteDao.deleteNote(userId, noteId);

  return deletedNote;
};

export const sortNormalList = async (userId) => {
  return await NoteListDao.sortNormalList(userId);
};

export const sortFavoriteList = async (userId) => {
  return await NoteListDao.sortFavoriteList(userId);
};

export const sortSharedList = async (userId, newOrder) => {
  await NoteListDao.sortSharedList(userId, newOrder);
};

export const fetchNotesByTitle = async (title, userId) => {
  return await NoteDao.fetchNoteByTitle(title, userId);
};
