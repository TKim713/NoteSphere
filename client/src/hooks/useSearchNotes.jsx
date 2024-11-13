import { useState } from "react";
import axios from "axios";

export const useSearchNotes = () => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  // const handleSearch = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_URL}/api/notes/search?title=${title}`
  //     );
  //     setNotes(response.data);
  //     setError("");
  //   } catch (err) {
  //     setError(err.response?.data?.message || "An error occurred.");
  //   }
  // };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notes/search`,
        {
          params: { title },
        }
      );
      setNotes(response.data); // Assuming the API returns filtered notes based on `title`
      setError(null);
    } catch (err) {
      setNotes([]);
    }
  };

  return {
    title,
    setTitle,
    notes,
    error,
    handleSearch,
  };
};
