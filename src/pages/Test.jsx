import React, { useState } from "react";
import Popup from "../components/Popup";

function TestPopup() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPopup(true)}>Afficher le Pop-up</button>

      {showPopup && (
        <Popup 
          message="Test du pop-up réussi !" 
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default TestPopup;
