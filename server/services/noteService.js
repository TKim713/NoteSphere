import NoteDao from "../daos/note/index.js";
import NoteListDao from "../daos/noteList/index.js";
import UserPermissionDao from "../daos/userPermission/index.js";
import CustomError from "../models/CustomError.js";
import { encryptContent } from "../util/encryptionUtils.js";

const checkForExistingNoteAndPermission = async (userId, noteId, permission) => {
  const existingNote = await NoteDao.fetchNoteById(noteId);

  if (!existingNote) {
    throw new CustomError("A note with that id does not exist.", 404);
  }

  if (existingNote.userId.toString() !== userId) {
    await UserPermissionDao.checkPermission(userId, noteId, permission);
  }

  return existingNote;
};

export const fetchUserNotes = async (userId, { limit = 10, skip = 0 } = {}) => {
  const notes = await NoteListDao.fetchUserNotes(userId, { limit, skip });

  const combinedNotes = [
    ...notes.normalListOrder,
    ...notes.favoriteListOrder,
    ...notes.sharedListOrder.map((sharedNote) => sharedNote.note),
  ];

  const paginatedNotes = {
    total: combinedNotes.length,
    data: combinedNotes.slice(skip, skip + limit),
    limit,
    skip,
  };

  paginatedNotes.hasMore = (skip + limit) < combinedNotes.length;

  paginatedNotes.data = paginatedNotes.data.map((note) => ({
    ...note,
    isFavorite: notes.favoriteListOrder.some((favoriteNote) => favoriteNote.id === note.id),
    isShared: notes.sharedListOrder.some((sharedNote) => sharedNote.note && sharedNote.note.id === note.id),
  }));

  return paginatedNotes;
};

export const fetchNoteContent = async (userId, noteId) => {
  const note = await NoteDao.fetchNoteContentById(noteId);

  if (!note) {
    throw new CustomError("A note with that id does not exist.", 404);
  }

  if (note.userId.toString() !== userId) {
    await UserPermissionDao.checkPermission(userId, noteId, 'View');
  }

  return { content: note.content };
};

export const addNote = async ({
  userId,
  noteId,
  title = "",
  emoji = "",
  content = [
    {
      "type": "text",
      "value": ""
    }]
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
  await checkForExistingNoteAndPermission(userId, noteId, 'Edit');
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
  await checkForExistingNoteAndPermission(userId, noteId, "Edit");

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

export const changePermission = async (userId, noteId, sharedUserId, permission) => {
  await checkForExistingNoteAndPermission(userId, noteId, 'All');
  return await UserPermissionDao.assignPermission(noteId, sharedUserId, permission);
};

export const fetchSharedUsers = async (noteId, userId, { limit = 5, skip = 0 } = {}) => {
  await checkForExistingNoteAndPermission(userId, noteId, 'All');
  return await UserPermissionDao.fetchSharedUsersByNoteId(noteId, { limit, skip });
};

export const saveContentImageToNote = async (noteId, userId, file) => {
  await checkForExistingNoteAndPermission(userId, noteId, 'Edit');

  const uploadResult = await NoteDao.uploadImageToCloudinary(file);

  const newContentBlock = encryptContent([
    {
      type: "image",
      value: uploadResult.secure_url,
    },
  ])[0];

  const updatedContent = { $push: { content: newContentBlock } };
  return await NoteDao.updateNote(noteId, updatedContent);
};