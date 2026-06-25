import { useState, useEffect } from "react";
import "../styles/TravelJournal.css";
import { getSuggestions, deleteSuggestion } from "../api/journal";

export default function TravelJournal({ tripName, token }) {
 

  // const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete(suggestionId) {
    try {
      await deleteSuggestion(suggestionId, token);

      setSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestionId)
      );
    } catch (err) {
      setError(err.message || "Failed to delete suggestion");
    }
  }

  useEffect(() => {
    console.log("suggestions state:", suggestions);
    if (!tripName || !token) return;

    async function loadSuggestions() {
      setLoading(true);
      setError(null);

      try {
        const res = await getSuggestions(tripName, token);
        console.log("RES:", res);
        console.log("RES.DATA:", res.data);
        setSuggestions(res.data || []);
      } catch (err) {
        console.error(err);
        console.error("Suggestions error:", err);
        setError(err.message || "Failed to load suggestions");
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, [tripName, token]);

  console.log("tripName é", tripName)
  console.log("render suggestions:", suggestions);
  console.log("render length:", suggestions.length);

  return (
    <div className="journal-container">

      <div className="journal-header">
        {tripName && <p className="trip-name">{tripName}</p>}
      </div>

      {/* SUGESTÕES */}
      <div className="journal-suggestions">
   
        {loading && <p>Loading suggestions...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && suggestions.length === 0 && (
          <p>No suggestions yet.</p>
        )}

        {suggestions.map((s) => (
          <div key={s.id} className="suggestion-card">
            <h4>{s.title}</h4>
            <p>{s.content}</p>

          <button
            onClick={() => handleDelete(s.id)}
            className="delete-btn"
          >
            Delete
          </button>


          </div>
        ))}

      </div>

    </div>
  );
}