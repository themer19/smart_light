import React, { useState } from 'react';
import './cr_compte.css';
import { Mail, Lock, User, Phone, Home, Calendar, MapPin } from 'lucide-react';

function Cr_compte() {
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    cin: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    bio: '',
    active: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="content d-flex flex-column justify-content-center align-items-center shadow-lg" style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
<h1 className="text-center" style={{ fontFamily: 'Cursive' }}>Créer un compte</h1>      <div style={{ maxHeight: '400px', overflowY: 'auto', width: '100%', overflowX: 'hidden' }}>
        <form onSubmit={handleSubmit} className="row g-3">
          {/* Champ Nom */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <User size={20} />
              </span>
              <input
                type="text"
                name="name"
                placeholder="Entre votre nom"
                value={formData.name}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Prénom */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <User size={20} />
              </span>
              <input
                type="text"
                name="prenom"
                placeholder="Entre votre Prénom"
                value={formData.prenom}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Email */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Mail size={20} />
              </span>
              <input
                type="email"
                name="email"
                placeholder="Entre votre email"
                value={formData.email}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="password"
                name="password"
                placeholder="Entre votre mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Confirmation de mot de passe */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer votre mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ CIN */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Lock size={20} />
              </span>
              <input
                type="text"
                name="cin"
                placeholder="CIN"
                value={formData.cin}
                onChange={handleChange}

                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Date de naissance */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Calendar size={20} />
              </span>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                placeholder="Entre votre Prénom"
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Genre */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <MapPin size={20} />
              </span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              >
                <option value="">Sélectionnez votre genre</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          {/* Champ Numéro de téléphone */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Phone size={20} />
              </span>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Numéro de téléphone"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Adresse */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <Home size={20} />
              </span>
              <input
                type="text"
                name="address"
                placeholder="Adresse"
                value={formData.address}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Ville */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <MapPin size={20} />
              </span>
              <input
                type="text"
                name="city"
                placeholder="Ville"
                value={formData.city}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Pays */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <MapPin size={20} />
              </span>
              <input
                type="text"
                name="country"
                placeholder="Pays"
                value={formData.country}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Code postal */}
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <MapPin size={20} />
              </span>
              <input
                type="text"
                name="postalCode"
                placeholder="Code postal"
                value={formData.postalCode}
                onChange={handleChange}
                className="form-control form-control-lg bg-light fs-6"
                required
              />
            </div>
          </div>

          {/* Champ Bio */}
          <div className="col-12">
            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-control form-control-lg bg-light fs-6"
              rows="3"
            ></textarea>
          </div>

          {/* Bouton d'inscription */}
          <div className="col-12 mb-3">
            <button className="btn btn-primary w-100 fs-6">
            Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cr_compte;
