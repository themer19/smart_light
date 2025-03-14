import React, { useState } from "react";
import "./login.css";
import hommeImage from "../assets/homme.png";
import hommeImage2 from "../assets/ajouter-un-utilisateur.png";
import { Mail,User,Lock,Calendar,Phone } from "lucide-react";
import { Tooltip } from "react-tooltip";

function Login() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div>
      <div className="titre">
      <h1 >
      Bienvenue chez LuxBoard
      </h1>
      </div>
    <div
      className={`content justify-content-center align-items-center d-flex shadow-lg ${
        isActive ? "active" : ""
      }`}
      
    >
      
      {/* Formulaire de Connexion */}
      <div className="col-md-6 right-box">
        <form>
          <div className="header-text mb-4">
            <h1>Connexion</h1>
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text bg-light">
              <Mail size={20} />
            </span>
            <input
              type="email"
              placeholder="E-mail"
              className="form-control form-control-lg bg-light fs-6"
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text bg-light">
              <Lock size={20} />
            </span>
            <input
              type="password"
              placeholder="Mot de passe"
              className="form-control form-control-lg bg-light fs-6"
            />
          </div>
          <div className="input-group mb-5 d-flex justify-content-center">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" />
              <label htmlFor="formcheck" className="form-check-label">
                Se souvenir de moi
              </label>
              <div className="forgot">
                <small>
                  <a href="#">Mot de passe oublié ?</a>
                </small>
              </div>
            </div>
          </div>
          <div className="input-group mb-3 justify-content-center">
  <button
    className="btn"
    style={{
      width: "50%", // Gardez la largeur à 50%
      fontSize: "1rem", // Taille de police personnalisée
      backgroundColor: "#03e706", // Couleur de fond par défaut
      color: "#fff", // Couleur du texte
      border: "none", // Supprime la bordure
      padding: "10px", // Padding personnalisée
      borderRadius: "8px", // Bordure arrondie
      fontWeight: 600, // Poids de police
      letterSpacing: "0.5px", // Espacement des lettres
      textTransform: "uppercase", // Transforme le texte en majuscules
      transition: "background-color 0.3s", // Transition pour l'effet de survol
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fffb00")} // Couleur au survol
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#03e706")} // Couleur par défaut
  >
     Connexion
  </button>
</div>
        </form>
      </div>

      {/* Formulaire d'inscription */}
      <div className="col-md-6 right-box">
        <form>
          <div className="header-text mb-4">
            <h1>Inscription</h1>
          </div>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              padding: "10px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <User size={20} />
              </span>
              <input
                type="text"
                placeholder="Nom"
                className="form-control form-control-lg bg-light fs-6"
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <User size={20} />
              </span>
              <input
                type="text"
                placeholder="Prénom"
                className="form-control form-control-lg bg-light fs-6"
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <Mail size={20} />
              </span>
              <input
                type="email"
                placeholder="E-mail"
                className="form-control form-control-lg bg-light fs-6"
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="password"
                placeholder="Mot de passe"
                className="form-control form-control-lg bg-light fs-6"
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className="form-control form-control-lg bg-light fs-6"
              />
            </div>

            <div className="input-group mb-3">
  <span className="input-group-text bg-light">
    <Calendar size={20} /> {/* Assurez-vous d'importer l'icône Calendar */}
  </span>
  <input
    type="date"
    className="form-control form-control-lg bg-light fs-6"
    placeholder="Date de naissance"
  />
</div>
<div className="input-group mb-3">
  <span className="input-group-text bg-light">
    <Phone size={20} /> {/* Assurez-vous d'importer l'icône Phone */}
  </span>
  <input
    type="tel"
    placeholder="Numéro de téléphone"
    className="form-control form-control-lg bg-light fs-6"
  />
</div>

<div className="input-group mb-3 justify-content-center">
        <button
          className="btn"
          style={{
            width: "100%",
            fontSize: "1rem",
            backgroundColor: "#03e706",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fffb00")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#03e706")}
        >
          S'inscrire
        </button>
      </div>
    </div>
        </form>
      </div>

      {/*d'interface ou je change */}
      <div className="switch-content">
        <div className="switch">
          <div className="switch-panel switch-right">
            <div className="icon-text-container">
              <div className="icon-container">
                <img src={hommeImage2} alt="Icône" className="icon" />
              </div>
              <h1>Bienvenue !</h1>
              <p>Saisissez vos coordonnées précises.</p>
            </div>

            <div style={{ position: "relative", top: "90px" }}>
              <div
                className="svg-container"
                onClick={() => setIsActive(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  onClick={() => setIsActive(true)}
                  fill="currentColor"
                  class="bi bi-arrow-bar-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                  />
                </svg>
                <span
                  style={{
                    color: "white",
                    fontSize: "16px",
                    fontFamily: "Arial",
                  }}
                >
                  Connexion
                </span>
              </div>
            </div>
          </div>
          <div className="switch-panel switch-left">
            <div className="icon-text-container">
              <div className="icon-container">
                <img src={hommeImage} alt="Icône" className="icon" />
              </div>
              <h1>Salut !</h1>
              <p>Nous sommes heureux de vous revoir</p>
            </div>

            <div style={{ position: "relative", top: "90px" }}>
              <div
                className="svg-container"
                onClick={() => setIsActive(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-arrow-bar-right svg-bottom-right"
                  viewBox="0 0 16 16"
                  onClick={() => setIsActive(false)}
                  style={{ marginRight: "-130px" }} // Espace entre l'icône et le texte
                >
                  <path
                    fillRule="evenodd"
                    d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                  />
                </svg>
                <span
                  style={{
                    color: "white",
                    fontSize: "16px",
                    fontFamily: "Arial",
                  }}
                >
                  Créer un compte
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;
