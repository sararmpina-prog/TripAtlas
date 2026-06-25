import { useState, useEffect } from "react";
import "../styles/TravelJournal.css";
import { getSuggestions, deleteSuggestion } from "../api/journal";

export default function TravelJournal({ tripName, token, suggestions, setSuggestions }) {
 

  // const [suggestions, setSuggestions] = useState([]);
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