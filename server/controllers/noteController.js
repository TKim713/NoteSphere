import {
  fetchNoteContent,
  fetchUserNotes,
  addNote,
  saveChangesToNote,
  favoriteNote,
  unfavoriteNote,
  duplicateNote,
  removeNote,
  sortNormalList,
  sortFavoriteList,
  fetchNotesByTitle,
} from "../services/noteService.js";

export const getNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const noteContent = await fetchNoteContent(req.user.id, noteId);

    res.json(noteContent);
  } catch (err) {
    if (err.message === 'No permission found for this note' || err.message === 'Insufficient permission for this action') {
      return res.status(403).json({ message: err.message });
    }
    return next(err);
  }
};

export const getUserNotes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = parseInt(req.query.skip, 10) || 0;

    const notes = await fetchUserNotes(req.user.id, { limit, skip });
    res.json(notes);
  } catch (err) {
    return next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { id } = req.body;

    const newNote = await addNote({ userId: req.user.id, noteId: id });

    res.json(newNote);
  } catch (err) {
    return next(err);
  }
};

export const editNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const noteDetails = req.body;
    const file = req.file ? req.file : null;

    await saveChangesToNote(userId, noteId, noteDetails, file);

    res.json({ message: "Success" });
  } catch (err) {
    return next(err);
  }
};

export const addNoteToFavorites = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    await favoriteNote(req.user.id, noteId);
    res.json({ message: "Success" });
  } catch (err) {
    return next(err);
  }
};

export const removeNoteFromFavorites = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    await unfavoriteNote(req.user.id, noteId);
    res.json({ message: "Success" });
  } catch (err) {
    return next(err);
  }
};

export const createDuplicateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { id: newNoteId, ...noteDetails } = req.body;

    const newNote = await duplicateNote({
      userId: req.user.id,
      existingNoteId: noteId,
      newNoteId,
      noteDetails,
    });

    res.json(newNote);
  } catch (err) {
    return next(err);
  }
};

// TODO: check for isFavorite
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    // const { isFavorite } = req.body;

    await removeNote(req.user.id, noteId);
    res.json({ message: "Success" });
  } catch (err) {
    return next(err);
  }
};

export const reorderNormalList = async (req, res, next) => {
  try {
    const sortedNotes = await sortNormalList(req.user.id);
    res.json({ message: "Success", sortedNotes });
  } catch (err) {
    return next(err);
  }
};

export const reorderFavoriteList = async (req, res, next) => {
  try {
    const sortedFavoriteNotes = await sortFavoriteList(req.user.id);
    res.json({ message: "Success", sortedFavoriteNotes });
  } catch (err) {
    return next(err);
  }
};

export const searchNotes = async (req, res, next) => {
  try {
    const { title } = req.query;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required for search." });
    }

    const notes = await fetchNotesByTitle(title, userId);

    if (!notes || notes.length === 0) {
      return res
        .status(404)
        .json({ message: "No notes found with the specified title." });
    }

    res.json(notes);
  } catch (err) {
    return next(err);
  }
};
