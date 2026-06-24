import React, { useState } from "react";
import "../styles/TravelJournal.css";

export default function TravelJournal() {
  const [text, setText] = useState("");

  return (
    <div className="journal-container">
      
      <div className="journal-header">
        <h2>✈ Travel Journal</h2>
      </div>

      <div className="journal-paper">
        <textarea
          className="journal-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I want to visit..."
        />
      </div>

    </div>
  );
}