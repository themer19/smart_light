import React, { useState, useEffect } from "react";
import "./cssP/validationuser.css"; // Assurez-vous que le chemin est correct
import emailIcon from "../assets/email.png";
import Popup from "../components/Popup";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
function Validationuser() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(Array(5).fill("")); // Tableau pour le code de vérification
  const location = useLocation();
  const email = location.state?.Data.email;
  const [timeLeft, setTimeLeft] = useState(120);
  const [attempts, setAttempts] = useState(0);
  const [successMessage, setSuccessMessage] = useState(""); // État pour le message de succès
  const [showPopup, setShowPopup] = useState(false); // État pour afficher le pop-up
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Démarrer le chronomètre
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0; // Arrête le chronomètre à 0
        }
        return prevTime - 1; // Décompte d'une seconde
      });
    }, 1000); // 1000 ms = 1 seconde

    return () => clearInterval(timer); // Nettoyage de l'intervalle à la désinscription
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };
  const handleChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
  };

  const validateCode = async () => {
    const codeEntered = verificationCode.join(""); // Convertir le tableau en chaîne
    try {
      const response = await axios.post("http://localhost:5000/api/users/verifecode", {
        email: email,
        verificationCode: codeEntered,
      });
  
      console.log(response.data);
  
      if (response.data.valid) {
        const userData = {
          nom: location.state?.Data.nom,
          prenom: location.state?.Data.prenom,
          email: location.state?.Data.email,
          motDePasse: location.state?.Data.motDePasse,
          dateDeNaissance: location.state?.Data.dateDeNaissance,
          cin: location.state?.Data.cin,
          genre: location.state?.Data.genre,
          numéroDeTéléphone: location.state?.Data.numéroDeTéléphone,
        };
  
  
        const addUserResponse = await axios.post("http://localhost:5000/api/users/ajoute", userData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        
        console.log(addUserResponse.data);
        setSuccessMessage("Utilisateur créé avec succès !");
        setShowPopup(true); // Affichez la réponse du serveur
      } 
      else
       {
        setMessage("Code de vérification invalide. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      if (error.response) 
        {
        console.error("Erreur de réponse:", error.response.data); // Affichez la réponse d'erreur du serveur
      }
      setAttempts(attempts + 1);
      if (attempts + 1 >= 3) {
        setErrorMessage("Vous avez atteint la limite d'essais !");
      } else {
        setErrorMessage(`Code incorrect, tentative ${attempts + 1}/3`);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Ferme le pop-up
  };

  return (
    <div>
      <div className="validation-content">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", height: "auto", paddingTop: "20px" }}>
          <img src={emailIcon} alt="Icône d'e-mail" style={{ width: "50px", height: "50px" }} />
        </div>

        <p style={{ textAlign: "center", marginBottom: "20px" }}>Vérifiez votre e-mail</p>
        <hr style={{ width: "80%", margin: "20px auto", border: "1px solid #ccc" }} />
        <h6 style={{ textAlign: "center" }}>Le code a été envoyé à:</h6>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>{email}</p>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Vérifiez votre boîte de réception et saisissez le code de vérification ci-dessous pour confirmer votre adresse e-mail. Notez bien que le code expirera dans : {formatTime(timeLeft)}
        </p>
        
        <div className="validation-verification-code" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          {verificationCode.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength={1} // Limite à un seul caractère
              className="validation-code-input"
              value={code}
              onChange={(e) => handleChange(index, e.target.value)}
              style={{
                width: "40px",
                height: "50px", // Hauteur des champs d'entrée
                margin: "0 5px",
                textAlign: "center",
                fontSize: "24px", // Taille de la police
              }} // Style pour les champs
            />
          ))}
        </div>
        {errorMessage && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{errorMessage}</p>}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Tentatives restantes : {3 - attempts}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            className="validation-btn"
            onClick={validateCode}
            disabled={attempts >= 3}
            style={{
              width: "100%",
              fontSize: "1rem",
              backgroundColor: "#03e706",
              color: "#fff",
              border: "none",
              backgroundColor: attempts >= 3 ? "#ccc" : "#03e706",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              transition: "background-color 0.3s",
              cursor: attempts >= 3 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#fffb00")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#03e706")
            }
          >
            Confirmer
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px' }}>
          <span style={{ cursor: 'pointer', color: '#03e706' }}>Renvoyer le code</span>
          <span style={{ cursor: 'pointer', color: '#03e706' }}>Changer l'e-mail</span>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '50px', marginLeft: '-50px', cursor: 'pointer', color: '#03e706' }} onClick={() => navigate("/")}>
        Retour à la page de connexion
      </p>
      {showPopup && (
  <Popup 
    message="Votre compte a été créé avec succès !" 
    onClose={() => setShowPopup(false)} 
    onConfirm={() => {
      setShowPopup(false);
      // Redirection ou autre action
    }}
  />
)}
    </div>
  );
}

export default Validationuser;
