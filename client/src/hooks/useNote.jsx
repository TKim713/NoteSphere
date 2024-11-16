import { useState } from "react";
import { v4 as uuid } from "uuid";
import axios from "axios";

import { useNoteContext } from "./useNoteContext";

import formatDuplicateName from "utils/formatDuplicateNames";

export const useNote = () => {
  const {
    notes = [],
    favoriteNotes = [],
    sharedNotes = [],
    selectedNote,
    dispatch,
    editingValue,
  } = useNoteContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreNotes, setHasMoreNotes] = useState(true); // Add state for checking if more notes are available
  const [currentPage, setCurrentPage] = useState(0);

  const createNote = async () => {
    setIsLoading(true);

    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const newNote = {
        id: uuid(),
        title: "",
        emoji: "",
        isFavorite: false,
        isShared: false,
        index: notes.length,
        favoriteIndex: null,
      };
      updatedNotes.push(newNote);

      dispatch({ type: "UPDATE_NORMAL_NOTES", payload: updatedNotes });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        id: newNote.id,
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes/`,
        body,
        config
      );
      setSelectedNote(newNote.id); //tu dong chuyen sang note moi tao
      dispatch({
        type: "SET_SELECTED_HEADER",
        payload: { ...newNote, content: null },
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setIsLoading(false);
    }
  };
  const loadMoreNotes = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);

    try {
      const skip = currentPage * 10; // Skip notes already loaded
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notes`,
        {
          params: { skip, limit: 10 },
        }
      );

      const newNotes = response.data.data;
      const updatedNotes = [
        ...notes,
        ...newNotes.filter(
          (note) => !notes.some((existingNote) => existingNote.id === note.id)
        ),
      ];

      // Dispatch the updated notes list
      dispatch({ type: "UPDATE_NORMAL_NOTES", payload: updatedNotes });

      setCurrentPage((prevPage) => prevPage + 1);
      setHasMoreNotes(response.data.hasMore);
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError(err);
      setIsLoading(false);
    }
  };
  const sharedNote = async () => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);

    try {
      const skip = currentPage * 10; // Skip notes already loaded
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notes`,
        {
          params: { skip, limit: 10 },
        }
      );

      const newNotes = response.data.data;
      const sharedNotes = newNotes.filter((note) => note.isShared); // Filter notes where isShared is true

      // Assuming you're dispatching the action to store shared notes
      dispatch({ type: "UPDATE_SHARED_NOTES", payload: sharedNotes });

      setCurrentPage((prevPage) => prevPage + 1);
      setHasMoreNotes(response.data.hasMore);
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError(err);
      setIsLoading(false);
    }
  };

  const renderLoadMoreButton = !isLoading && notes.length >= 10 && hasMoreNotes;

  const setSelectedNote = async (id) => {
    setIsLoading(true);
    try {
      const selectedNote = notes.find((note) => note.id === id);

      dispatch({
        type: "SET_SELECTED_HEADER",
        payload: { ...selectedNote, content: null },
      });

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`
      );

      dispatch({ type: "SET_SELECTED_CONTENT", payload: res.data.content });

      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      if (err.response.status === 404) {
        // const updatedNotes = [...notes];
        const updatedNotes = Array.isArray(notes) ? [...notes] : [];

        const existingNoteIndex = notes.findIndex((note) => note.id === id);

        updatedNotes.splice(existingNoteIndex, 1);

        dispatch({
          type: "NOTE_NOT_FOUND",
          payload: updatedNotes,
        });
      }

      setIsLoading(false);
    }
  };

  const editSelectedNote = (key, value) => {
    dispatch({
      type: "EDIT_SELECTED_NOTE",
      payload: { key, value },
    });
  };
  const saveSelectedChanges = async ({
    id,
    title,
    emoji,
    content,
    coverImage,
  }) => {
    setError(null);
  
    try {
      // Clone existing notes arrays to ensure we're not directly mutating the state
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];
      const updatedFavoriteNotes = [...favoriteNotes];
      const updatedSharedNotes = [...sharedNotes];
  
      const currentSelectedNote = { ...selectedNote, coverImage };
  
      // Update the main notes list
      const existingNormalNoteIndex = notes.findIndex((note) => note.id === id);
      updatedNotes.splice(existingNormalNoteIndex, 1, currentSelectedNote);
  
      // Only update favoriteNotes if this note is in the favorites
      const existingFavoriteNoteIndex = favoriteNotes.findIndex(
        (note) => note.id === id
      );
      if (existingFavoriteNoteIndex >= 0) {
        updatedFavoriteNotes.splice(existingFavoriteNoteIndex, 1, {
          id: currentSelectedNote.id,
          title: currentSelectedNote.title,
          emoji: currentSelectedNote.emoji,
          coverImage: currentSelectedNote.coverImage,
        });
      }
  
      // Only update sharedNotes if this note is in the shared notes
      const existingSharedNoteIndex = sharedNotes.findIndex(
        (note) => note.id === id
      );
      if (existingSharedNoteIndex >= 0) {
        updatedSharedNotes.splice(existingSharedNoteIndex, 1, {
          id: currentSelectedNote.id,
          title: currentSelectedNote.title,
          emoji: currentSelectedNote.emoji,
          coverImage: currentSelectedNote.coverImage,
        });
      }
  
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("emoji", emoji);
      formData.append("content", content);
      if (coverImage instanceof File) {
        formData.append("coverImage", coverImage);
      }
  
      // Make the API request to save the changes
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      // Dispatch to update the global state with the new data
      dispatch({
        type: "SAVE_SELECTED_CHANGES",
        payload: {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          sharedNotes: updatedSharedNotes,
          content,
          coverImage, // Ensure coverImage is included in the payload
        },
      });
    } catch (err) {
      console.error(err.message);
      setError(err);
    }
  };
  const setEditingValue = (payload) => {
    dispatch({ type: "SET_EDITING_VALUE", payload });
  };

  const updateEditingValue = (key, value) => {
    dispatch({
      type: "UPDATE_EDITING_VALUE",
      payload: { key, value },
    });
  };

  const saveEditingValue = async ({ id, title, emoji }) => {
    setError(null);
    console.log(id, title, emoji);
    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const updatedFavoriteNotes = [...favoriteNotes];
      const currentEditingValue = editingValue;

      const existingNormalNoteIndex = notes.findIndex((note) => note.id === id);
      updatedNotes.splice(existingNormalNoteIndex, 1, currentEditingValue);

      const existingFavoriteNoteIndex = favoriteNotes.findIndex(
        (note) => note.id === id
      );

      if (existingFavoriteNoteIndex >= 0) {
        updatedFavoriteNotes.splice(existingFavoriteNoteIndex, 1, {
          id: currentEditingValue.id,
          title: currentEditingValue.title,
          emoji: currentEditingValue.emoji,
        });
      }

      dispatch({
        type: "SAVE_EDITING_VALUE",
        payload: {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
        },
      });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        title,
        emoji,
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
        body,
        config
      );
    } catch (err) {
      console.error(err.message);
      setError(err);
    }
  };

  const favoriteNote = async (id) => {
    setError(null);

    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const updatedFavoriteNotes = [...favoriteNotes];

      const existingNoteIndex = notes.findIndex((note) => note.id === id);

      updatedNotes[existingNoteIndex].isFavorite = true;
      updatedFavoriteNotes.push({
        id: updatedNotes[existingNoteIndex].id,
        title: updatedNotes[existingNoteIndex].title,
        emoji: updatedNotes[existingNoteIndex].emoji,
      });

      let payload;

      if (selectedNote && selectedNote.id === id) {
        payload = {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          selectedNote: updatedNotes[existingNoteIndex],
        };
      } else {
        payload = {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          selectedNote,
        };
      }

      dispatch({
        type: "TOGGLE_FAVORITE_NOTE",
        payload,
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}/favorite`
      );
    } catch (err) {
      console.error(err.message);
      setError(err);
    }
  };

  const unfavoriteNote = async (id) => {
    setError(null);

    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const updatedFavoriteNotes = favoriteNotes.filter(
        (note) => note.id !== id
      );

      const existingNoteIndex = notes.findIndex((note) => note.id === id);

      updatedNotes[existingNoteIndex].isFavorite = false;

      let payload;

      if (selectedNote && selectedNote.id === id) {
        payload = {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          selectedNote: updatedNotes[existingNoteIndex],
        };
      } else {
        payload = {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          selectedNote,
        };
      }

      dispatch({
        type: "TOGGLE_FAVORITE_NOTE",
        payload,
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}/unfavorite`
      );
    } catch (err) {
      console.error(err.message);
      setError(err);
    }
  };

  const sortNormalNotes = async (id, newIndex) => {
    const notesToUpdate = notes.filter((note) => note.id !== id);

    notesToUpdate.splice(
      newIndex,
      0,
      notes.find((note) => note.id === id)
    );

    const updatedNotes = notesToUpdate.map((note, index) => ({
      ...note,
      index,
    }));

    dispatch({ type: "SORT_NORMAL_NOTES", payload: updatedNotes });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({
      newOrder: updatedNotes.map((note) => note.id),
    });

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/notes/sortNormalList`,
      body,
      config
    );
  };
  const sortSharedNotes = (id, newIndex) => {
    // Lọc các ghi chú khác ngoài ghi chú có id tương ứng
    const notesToUpdate = sharedNotes.filter((note) => note.id !== id);

    // Thêm ghi chú vào vị trí mới
    notesToUpdate.splice(
      newIndex,
      0,
      notes.find((note) => note.id === id)
    );

    // Cập nhật lại chỉ số (index) của các ghi chú
    const updatedNotes = notesToUpdate.map((note, index) => ({
      ...note,
      index,
    }));

    // Dispatch action cập nhật state trong Redux
    dispatch({ type: "SORT_SHARED_NOTES", payload: updatedNotes });
  };

  const sortFavoriteNotes = async (id, newIndex) => {
    const notesToUpdate = favoriteNotes.filter((note) => note.id !== id);

    notesToUpdate.splice(
      newIndex,
      0,
      notes.find((note) => note.id === id)
    );

    const updatedNotes = notesToUpdate.map((note, index) => ({
      ...note,
      index,
    }));

    dispatch({ type: "SORT_FAVORITE_NOTES", payload: updatedNotes });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({
      newOrder: updatedNotes.map((note) => note.id),
    });

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/notes/sortFavoriteList`,
      body,
      config
    );
  };

  const duplicateNote = async (id) => {
    setError(null);
    // setIsLoading(true);

    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const existingNote = notes.find((note) => note.id === id);

      const existingNoteTitles = notes.map((note) => note.title);

      const formattedName = formatDuplicateName(
        `Copy of ${existingNote.title}`,
        existingNoteTitles
      );

      const duplicate = {
        id: uuid(),
        title: formattedName,
        emoji: existingNote.emoji,
        isFavorite: false,
      };

      const existingNoteIndex = notes.findIndex((note) => note.id === id);

      updatedNotes.splice(existingNoteIndex + 1, 0, duplicate);

      dispatch({ type: "UPDATE_NORMAL_NOTES", payload: updatedNotes });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify(duplicate);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}/duplicate`,
        body,
        config
      );

      // setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      // setIsLoading(false);
    }
  };

  const deleteNote = async (id) => {
    setError(null);
    setIsLoading(true);

    try {
      // const updatedNotes = [...notes];
      const updatedNotes = Array.isArray(notes) ? [...notes] : [];

      const updatedFavoriteNotes = [...favoriteNotes];

      const existingNoteIndex = notes.findIndex((note) => note.id === id);
      updatedNotes.splice(existingNoteIndex, 1);

      const existingFavoriteNoteIndex = favoriteNotes.findIndex(
        (note) => note.id === id
      );

      if (existingFavoriteNoteIndex >= 0) {
        updatedFavoriteNotes.splice(existingFavoriteNoteIndex, 1);
      }

      let payload;

      if (selectedNote && selectedNote.id === id) {
        payload = {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
          selectedNote: null,
        };
      } else {
        payload = { notes: updatedNotes, favoriteNotes: updatedFavoriteNotes };
      }

      dispatch({ type: "DELETE_NOTE", payload });

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${id}`);

      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const updateEmojiFromNav = async (id, emoji) => {
    setError(null);
    // setIsLoading(true);
    try {
      const updatedNotes = [...notes];
      const updatedFavoriteNotes = [...favoriteNotes];

      const existingNormalNoteIndex = notes.findIndex((note) => note.id === id);
      updatedNotes[existingNormalNoteIndex].emoji = emoji;

      const existingFavoriteNoteIndex = favoriteNotes.findIndex(
        (note) => note.id === id
      );

      if (existingFavoriteNoteIndex >= 0) {
        updatedFavoriteNotes[existingFavoriteNoteIndex].emoji = emoji;
      }

      dispatch({
        type: "UPDATE_EMOJI_FROM_NAV",
        payload: {
          notes: updatedNotes,
          favoriteNotes: updatedFavoriteNotes,
        },
      });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify({
        emoji,
      });

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
        body,
        config
      );
      setIsLoading(false);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return {
    setSelectedNote,
    createNote,
    loadMoreNotes,
    editSelectedNote,
    saveSelectedChanges,
    favoriteNote,
    sharedNote,
    unfavoriteNote,
    duplicateNote,
    deleteNote,
    sortNormalNotes,
    sortFavoriteNotes,
    sortSharedNotes,
    setEditingValue,
    updateEditingValue,
    saveEditingValue,
    updateEmojiFromNav,
    isLoading,
    error,
    hasMoreNotes,
    renderLoadMoreButton,
  };
};
