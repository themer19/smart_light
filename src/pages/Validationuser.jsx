import React, { useState, useEffect } from "react";
import "./cssP/validationuser.css"; // Assurez-vous que le chemin est correct
import emailIcon from "../assets/email.png";

function Validationuser() {
  const [verificationCode, setVerificationCode] = useState(Array(5).fill("")); // Tableau pour le code de vérification
  let email = "test@example.com";
  const [timeLeft, setTimeLeft] = useState(120);

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
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  };
  const handleChange = (index, value) => {
    // Met à jour le code de vérification à l'index donné
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
  };

  return (
    <div>
      <div className="content">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "auto",
            paddingTop: "20px",
          }}
        >
          <img
            src={emailIcon}
            alt="Icône d'e-mail"
            style={{ width: "50px", height: "50px" }}
          />
        </div>

        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Vérifiez votre e-mail
        </p>
        <hr
          style={{
            width: "80%",
            margin: "20px auto",
            border: "1px solid #ccc",
          }}
        />
        <h6 style={{ textAlign: "center" }}>Le code a été envoyé à:</h6>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>{email}</p>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Vérifiez votre boîte de réception et saisissez le code de vérification
          ci-dessous pour confirmer votre adresse e-mail. Notez bien que le code
          expirera dans : {formatTime(timeLeft)}
        </p>
        <div
          className="verification-code"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {verificationCode.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength={1} // Limite à un seul caractère
              className="code-input"
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            className="btn btn-primary mt-3"
            onClick={() => console.log(verificationCode)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px',  }}>
          <span style={{ cursor: 'pointer', color: '#03e706' }}>Renvoyer le mot de passe</span>
          <span style={{ cursor: 'pointer', color: '#03e706' }}>Changer l'e-mail</span>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '50px', marginLeft: '-50px', cursor: 'pointer', color: '#03e706' }}>
  Retour à la page de connexion
</p>

    </div>
  );
}

export default Validationuser;
