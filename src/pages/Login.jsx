import React, { useState, useRef } from "react";
import "./cssP/login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import hommeImage from "../assets/homme.png";
import { Dialog } from "primereact/dialog";
import hommeImage2 from "../assets/ajouter-un-utilisateur.png";
import {
  Mail,
  User,
  Lock,
  Calendar,
  Phone,
  IdCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { data, useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import axios from "axios";
function Login() {
  const toast = useRef(null);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", motDePasse: "" });
  const [registerData, setRegisterData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    CmotDePasse: "",
    dateDeNaissance: "",
    genre: "",
    numéroDeTéléphone: "",
    cin: "",
  });
  const [message, setMessage] = useState("");
  const handleChange = (e, type) => {
    if (type === "login") {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    } else {
      setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email) {
      toast.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "E-mail est vide.",
        life: 5000,
      });
    }
    if (!loginData.motDePasse) {
      toast.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "Mot de passe est vide.",
        life: 5000,
      });
    }
    if (!loginData.email || !loginData.motDePasse) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        JSON.stringify(loginData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Connexion réussie !");
      console.log(response.data);
      console.log(response);

      localStorage.setItem("token", response.data.token);
    } catch (error) {
      // Vérifiez si l'erreur a une réponse avec un message
      if (error.response && error.response.data) {
        // Affichez le message d'erreur de l'API
        setMessage(
          error.response.data.message ||
            "Erreur de connexion. Vérifiez vos identifiants."
        );
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail: error.response.data.message,
          life: 5000,
        });
      } else {
        setMessage("Erreur de connexion. Vérifiez vos identifiants.");
      }
      console.error("Erreur d'inscription:", error);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log(registerData);
    try {
      const emptyFields = [];
      if (!registerData.nom) emptyFields.push("Nom");
      if (!registerData.prenom) emptyFields.push("Prénom");
      if (!registerData.email) {
        emptyFields.push("E-mail");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail: "L'e-mail n'est pas valide.",
          life: 5000,
        });
        return;
      }
      if (!registerData.motDePasse) {
        emptyFields.push("Mot de passe");
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(
          registerData.motDePasse
        )
      ) {
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail:
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.",
          life: 5000,
        });
        return;
      }

      if (!registerData.dateDeNaissance) emptyFields.push("Date de naissance");
      if (!registerData.genre) emptyFields.push("Genre");
      if (!registerData.numéroDeTéléphone) {
        emptyFields.push("Numéro de téléphone");
      } else if (!/^\d{8}$/.test(registerData.numéroDeTéléphone)) {
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail: "Le numéro de téléphone doit contenir exactement 8 chiffres.",
          life: 5000,
        });
        return;
      }
      if (!registerData.cin) {
        emptyFields.push("CIN");
      } else if (!/^[01][0-9]{7}$/.test(registerData.cin)) {
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail:
            "Le CIN doit commencer par 0 ou 1, contenir exactement 8 chiffres et ne doit contenir que des chiffres.",
          life: 5000,
        });
        return;
      }

      if (emptyFields.length > 0) {
        // Afficher un toast pour les champs vides
        toast.current.show({
          severity: "error",
          summary: "Erreur",
          detail: `Les champs suivants sont vides : ${emptyFields.join(", ")}`,
          life: 5000,
        });
        return; // Ne continue pas si des champs sont vides
      }
      const checkResponse = await axios.post(
        "http://localhost:5000/api/users/VerifierExistence",
        {
          cin: registerData.cin,
          email: registerData.email,
          numeroDeTelephone: registerData.numéroDeTéléphone,
        }
      );

      const messages = [];
      // Vérification des champs existants
      if (checkResponse.data.emailExists) {
        messages.push("L'email est déjà utilisé.");
      }
      if (checkResponse.data.cinExists) {
        messages.push("Le CIN est déjà utilisé.");
      }
      if (checkResponse.data.numeroDeTelephoneExists) {
        messages.push("Le numéro de téléphone est déjà utilisé.");
      }

      // Si des erreurs existent, afficher le toast et arrêter le processus
      if (messages.length > 0) {
        messages.forEach((msg) => {
          toast.current.show({
            severity: "error",
            summary: "Erreur",
            detail: msg,
            life: 5000,
          });
        });
        return;
      }

      // Si tout est bon, procéder à l'envoi du code
      const response = await axios.post(
        "http://localhost:5000/api/users/code",
        { email: registerData.email },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage("Inscription réussie !");
      toast.current.show({
        severity: "success",
        summary: "Succès",
        detail: "Inscription réussie !",
        life: 5000,
      });
      navigate("/validation", { state: { Data: registerData } });
      console.log(response.data);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "Erreur lors de l'inscription. Vérifiez vos informations.",
        life: 5000,
      });
    }
  };
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = () => {
    setDisplayDialog(true);
  };
  const [displayDialog, setDisplayDialog] = useState(false);
  const [email, setEmail] = useState("");
  const fermeDialogHide = () => {
    setDisplayDialog(false);
    setEmail("");
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const miseajourMP = async () => {
    if (loading) return; // Ne pas continuer si une demande est déjà en cours

    setLoading(true); // Indiquer que la demande est en cours

    try {
        const response = await axios.post(
            "http://localhost:5000/api/users/ForgotPassword",
            { email }
        );

        // Affiche le Toast de succès seulement si la réponse est réussie
        if (response.status === 200) {
            toast.current.show({
                severity: "success",
                summary: "Succès",
                detail: "Un e-mail de réinitialisation a été envoyé.",
                life: 5000,
            });
        }
        fermeDialogHide(); 
    } catch (error) {
        // Vérifie si l'erreur a une réponse
        if (error.response && error.response.data) {
            toast.current.show({
                severity: "error",
                summary: "Erreur",
                detail: error.response.data.message || "Erreur lors de l'envoi de l'e-mail.",
                life: 5000,
            });
        } else {
            toast.current.show({
                severity: "error",
                summary: "Erreur",
                detail: "Erreur lors de l'envoi de l'e-mail.",
                life: 5000,
            });
        }
    } finally {
        setLoading(false); // Réinitialiser l'état de chargement
    }
};
  return (
    <div className="login-page">
    <div>
      <div className="titre">
        <h1>Bienvenue chez LuxBoard</h1>
      </div>
      <div
        className={`content justify-content-center align-items-center d-flex shadow-lg ${
          isActive ? "active" : ""
        }` }
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
                name="email"
                placeholder="E-mail"
                onChange={(e) => handleChange(e, "login")}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="password"
                name="motDePasse"
                placeholder="Mot de passe"
                onChange={(e) => handleChange(e, "login")}
                className="form-control form-control-lg bg-light fs-6"
                required
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
                    <a href="#" onClick={handleForgotPassword}>
                      Mot de passe oublié ?
                    </a>
                  </small>
                </div>
              </div>
            </div>
            <div className="input-group mb-3 justify-content-center">
              <button
                className="btn"
                style={{
                  width: "50%", 
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fffb00")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#03e706")
                }
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Connexion"}
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
                  name="nom"
                  onChange={(e) => handleChange(e, "register")}
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
                  name="prenom"
                  onChange={(e) => handleChange(e, "register")}
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
                  name="email"
                  onChange={(e) => handleChange(e, "register")}
                  className="form-control form-control-lg bg-light fs-6"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  name="motDePasse"
                  placeholder="Mot de passe"
                  onChange={(e) => handleChange(e, "register")}
                  className="form-control form-control-lg bg-light fs-6"
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  name="CmotDePasse"
                  placeholder="Confirmer le mot de passe"
                  onChange={(e) => handleChange(e, "register")}
                  className="form-control form-control-lg bg-light fs-6"
                />
              </div>

              <div className="mb-3">
                <small
                  className="form-text text-muted"
                  style={{ textAlign: "center" }}
                >
                  Sélectionnez votre date de naissance
                </small>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Calendar size={20} />{" "}
                    {/* Assurez-vous d'importer l'icône Calendar */}
                  </span>
                  <input
                    type="date"
                    name="dateDeNaissance"
                    className="form-control form-control-lg bg-light fs-6"
                    onChange={(e) => handleChange(e, "register")}
                    aria-label="Date de naissance"
                  />
                </div>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <Phone size={20} />{" "}
                  {/* Assurez-vous d'importer l'icône Phone */}
                </span>
                <input
                  type="tel"
                  name="numéroDeTéléphone"
                  placeholder="Numéro de téléphone"
                  className="form-control form-control-lg bg-light fs-6"
                  onChange={(e) => handleChange(e, "register")}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <IdCard size={20} />{" "}
                </span>
                <input
                  type="text"
                  placeholder="CIN"
                  name="cin"
                  className="form-control form-control-lg bg-light fs-6"
                  maxLength={8} // Limite la longueur à 8 caractères
                  aria-label="CIN"
                  onChange={(e) => handleChange(e, "register")}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text bg-light">
                  <User size={20} />
                </span>
                <select
                  name="genre"
                  onChange={(e) => handleChange(e, "register")}
                  className="form-control form-control-lg bg-light fs-6"
                >
                  <option value="">Choisissez genre</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fffb00")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#03e706")
                  }
                  onClick={handleRegister}
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </form>
        </div>

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
                    className="bi bi-arrow-bar-left"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
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
      <Dialog
        header="Réinitialiser le mot de passe"
        visible={displayDialog}
        style={{ width: "50vw" }}
        onHide={fermeDialogHide}
      >
        <div>
          <label htmlFor="email">
            Veuillez entrer votre e-mail pour recevoir un lien vous permettant
            de modifier votre mot de passe:
          </label>
          <div style={{ position: "relative", marginTop: "20px" }}>
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#aaa", // Couleur de l'icône
              }}
            >
              <Mail size={20} />
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="E-mail"
              style={{
                width: "100%",
                padding: "10px 10px 10px 40px", // Ajoute de l'espace à gauche pour l'icône
                marginTop: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)", // Ombre pour un effet de profondeur
                transition: "border-color 0.3s", // Transition pour le changement de couleur
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#03e706")} // Change la couleur de la bordure au focus
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")} // Réinitialise la couleur de la bordure
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <Button
              label={loading ? "Envoi en cours..." : "Envoyer"}
              onClick={miseajourMP}
              disabled={loading}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fffb00")
              }
              style={{
                backgroundColor: "#03e706",
                color: "#fff",
                border: "none",
                transition: "background-color 0.3s",
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#03e706")
              }
            />
            <Button
              label="Annuler"
              onClick={fermeDialogHide}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fffb00")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#03e706")
              }
              style={{
                marginLeft: "10px",
                backgroundColor: "#03e706",
                color: "#fff",
                border: "none",
              }}
            />
          </div>
        </div>
      </Dialog>
      <Toast ref={toast} />
    </div>
    </div>
  );
}

export default Login;
