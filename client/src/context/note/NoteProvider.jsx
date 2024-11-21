import { useReducer, useEffect } from "react";
import axios from "axios";

import { useAuthContext } from "hooks/useAuthContext";

import NoteContext from "./note-context";

const initialState = {
  notesAreReady: false,
  notes: [],
  favoriteNotes: [],
  sharedNotes: [],
  selectedNote: null,
  editingValue: null,
};

const noteReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case "LOAD_NOTES": {
      return {
        ...state,
        notesAreReady: true,
        notes: payload.normalListOrder,
        favoriteNotes: payload.favoriteListOrder,
        sharedNotes: payload.sharedListOrder,
      };
    }

    case "NOTE_NOT_FOUND": {
      return {
        ...state,
        selectedNote: null,
        // notes: payload,
      };
    }

    case "SET_SELECTED_HEADER": {
      return {
        ...state,
        selectedNote: payload,
      };
    }

    // case "SET_SELECTED_CONTENT": {
    //   console.log("SET_SELECTED_CONTENT is running");
    //   return {
    //     ...state,
    //     selectedNote: !state.selectedNote
    //       ? null
    //       : { ...state.selectedNote, content: payload },
    //   };
    // }
    case "SET_SELECTED_CONTENT": {
      console.log("SET_SELECTED_CONTENT is running");
      return {
        ...state,
        selectedNote: !state.selectedNote
          ? null
          : {
              ...state.selectedNote,
              content: Array.isArray(payload) ? payload : [payload], // Ensure it's an array
            },
      };
    }

    case "EDIT_SELECTED_NOTE": {
      const { key, value } = payload;
      return {
        ...state,
        selectedNote: {
          ...state.selectedNote,
          [key]: value,
          updatedAt: new Date(),
        },
      };
    }

    case "SET_EDITING_VALUE": {
      return {
        ...state,
        editingValue: payload,
      };
    }

    case "UPDATE_EDITING_VALUE": {
      const { key, value } = payload;
      return {
        ...state,
        editingValue: {
          ...state.editingValue,
          [key]: value,
          updatedAt: new Date(),
        },
      };
    }

    case "SAVE_EDITING_VALUE":
    case "UPDATE_EMOJI_FROM_NAV": {
      return {
        ...state,
        ...payload,
      };
    }
    // Trong reducer
    case "UPDATE_SHARED_NOTES":
      return {
        ...state,
        sharedNotes: action.payload,
      };

    case "TOGGLE_FAVORITE_NOTE": {
      return {
        ...state,
        notes: [...payload.notes],
        favoriteNotes: [...payload.favoriteNotes],
        selectedNote: { ...state.selectedNote, ...payload.selectedNote },
      };
    }
    case "TOGGLE_SHARED_NOTE": {
      return {
        ...state,
        notes: [...payload.notes],
        sharedNotes: [...payload.sharedNotes],
        selectedNote: { ...state.selectedNote, ...payload.selectedNote },
      };
    }

    case "UPDATE_NORMAL_NOTES": {
      return {
        ...state,
        notes: payload,
      };
    }

    // case 'SAVE_SELECTED_CHANGES': {
    //   return {
    //     ...state,
    //     notes: payload.notes,
    //     favoriteNotes: payload.favoriteNotes,
    //     selectedNote: { ...state.selectedNote, content: payload.content },
    //   };
    // }
    // case "SAVE_SELECTED_CHANGES":
    //   return {
    //     ...state,
    //     notes: action.payload.notes,
    //     favoriteNotes: action.payload.favoriteNotes,
    //     selectedNote: {
    //       ...state.selectedNote,
    //       content: action.payload.content, // Ensure content is updated as an array
    //     },
    //   };

    case "SAVE_SELECTED_CHANGES":
      return {
        ...state,
        notes: action.payload.notes,
        favoriteNotes: action.payload.favoriteNotes,
        sharedNotes: action.payload.sharedNotes,
        selectedNote: {
          ...state.selectedNote,
          content: Array.isArray(action.payload.content)
            ? action.payload.content
            : [action.payload.content], // Ensure content is an array
        },
      };
    case "SORT_NORMAL_NOTES": {
      return {
        ...state,
        notes: payload,
      };
    }

    case "SORT_FAVORITE_NOTES": {
      return {
        ...state,
        favoriteNotes: payload,
      };
    }
    case "SORT_SHARED_NOTES": {
      return {
        ...state,
        sharedNotes: payload,
      };
    }

    case "DELETE_NOTE": {
      console.log("DELETE_NOTE is running");

      return {
        ...state,
        ...payload,
      };
    }

    default:
      return state;
  }
};

const NoteProvider = ({ children }) => {
  const { user } = useAuthContext();

  const [state, dispatch] = useReducer(noteReducer, initialState);

  console.log("notes", state);

  // useEffect(() => {
  //   if (user) {
  //     (async () => {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_API_URL}/api/notes`
  //       );
  //       dispatch({ type: "LOAD_NOTES", payload: res.data });
  //     })();
  //   }
  // }, [user]);
  useEffect(() => {
    if (user) {
      (async () => {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notes`
        );
        // Chuyển data từ backend vào payload
        dispatch({
          type: "LOAD_NOTES",
          payload: {
            notesAreReady: true,
            normalListOrder: res.data.data,
            favoriteListOrder: res.data.data.filter((note) => note.isFavorite),
            sharedListOrder: res.data.data.filter((note) => note.isShared),
          },
        });
      })();
    }
  }, [user]);

  return (
    <NoteContext.Provider value={{ ...state, dispatch }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteProvider;
