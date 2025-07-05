import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'remixicon/fonts/remixicon.css';
import './AdminProfilePage.css';

const AdminProfilePage = ({ onClose, adminId }) => {
  const toast = useRef(null);
  const [adminData, setAdminData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: '',
    cin: '',
    dateDeNaissance: null,
    genre: '',
    numéroDeTéléphone: '',
    adresse: '',
    ville: '',
    pays: '',
    codePostal: '',
    estActif: false,
    verificationCode: '',
    valideCode: '',
    license: [],
    crééLe: '',
    misÀJourLe: '',
    __v: 0,
    profileImage: null,
  });
  const [initialAdminData, setInitialAdminData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isModified, setIsModified] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Support', value: 'Support' },
  ];

  const genreOptions = [
    { label: 'Homme', value: 'homme' },
    { label: 'Femme', value: 'femme' },
    { label: 'Autre', value: 'autre' },
  ];

  const estActifOptions = [
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      if (!adminId) return;
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) throw new Error('Utilisateur non authentifié');
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Réponse non valide de l\'API');
        const data = await response.json();
        if (isMounted) {
          const formattedData = {
            ...data,
            dateDeNaissance: data.dateDeNaissance ? new Date(data.dateDeNaissance) : null,
            license: data.license || [],
          };
          setAdminData(formattedData);
          setInitialAdminData(formattedData);
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de charger les données : ${error.message}`,
          life: 3000,
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAdminData();
    return () => { isMounted = false; };
  }, [adminId]);

  useEffect(() => {
    let isMounted = true;
    const fetchLicenses = async () => {
      if (!adminData._id) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Utilisateur non authentifié');
        const response = await fetch(`http://localhost:5000/api/licences/user/${adminData._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Échec du chargement des licences');
        const { data: licenses } = await response.json();
        if (isMounted) {
          setAdminData((prev) => ({
            ...prev,
            license: licenses.map((lic) => ({
              id: lic._id || lic.id,
              nom: lic.nom,
              type: lic.type,
              statut: lic.statut,
              cleLicence: lic.cleLicence,
              dateExpiration: lic.dateExpiration ? new Date(lic.dateExpiration) : null,
              identifiantUnique: lic.identifiantUnique,
              lampadairesMax: lic.lampadairesMax,
              zone: lic.zone,
              dateCreation: lic.dateCreation ? new Date(lic.dateCreation) : null,
            })),
          }));
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de charger les licences : ${error.message}`,
          life: 3000,
        });
      }
    };
    fetchLicenses();
    return () => { isMounted = false; };
  }, [adminData._id]);

  useEffect(() => {
    const { newPassword, confirmPassword } = passwordData;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (newPassword) {
      if (passwordRegex.test(newPassword)) {
        setPasswordStrength('Fort');
        setPasswordError('');
      } else {
        setPasswordStrength('Faible');
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      }
    } else {
      setPasswordStrength('');
      setPasswordError('');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [passwordData.newPassword, passwordData.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setAdminData((prev) => ({ ...prev, dateDeNaissance: e.value }));
    setIsModified(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Seuls les formats JPEG et PNG sont autorisés',
        life: 3000,
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: "L'image ne doit pas dépasser 2 Mo",
        life: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setAdminData((prev) => ({ ...prev, profileImage: file }));
      setIsModified(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Tous les champs doivent être remplis',
        life: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les nouveaux mots de passe ne correspondent pas',
        life: 3000,
      });
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
        life: 3000,
      });
      return;
    }

    setShowPasswordConfirmDialog(true);
  };

  const confirmPasswordUpdate = async () => {
    setShowPasswordConfirmDialog(false);
    setIsLoading(true);
    try {
      const { currentPassword, newPassword } = passwordData;
      const response = await fetch(`http://localhost:5000/api/users/${adminData._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword, email: adminData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de la mise à jour du mot de passe');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: data.message || 'Mot de passe mis à jour avec succès',
        life: 3000,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength('');
      setPasswordMismatch(false);
      setPasswordError('');
      setActiveTab('profile');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.message || 'Une erreur est survenue lors de la mise à jour du mot de passe',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPasswordUpdate = () => {
    setShowPasswordConfirmDialog(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isModified) {
      setShowConfirmDialog(true);
    } else {
      toast.current?.show({
        severity: 'info',
        summary: 'Info',
        detail: 'Aucune modification à enregistrer',
        life: 3000,
      });
      onClose?.();
    }
  };

  const confirmSave = () => {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setTimeout(() => {
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Profil mis à jour avec succès',
        life: 3000,
      });
      setIsModified(false);
      setIsLoading(false);
      onClose?.();
    }, 1000);
  };

  const cancelSave = () => {
    setShowConfirmDialog(false);
  };

  if (!adminData || isLoading) {
    return (
      <div className="admin-profile-loading" role="status" aria-live="polite">
        <i className="ri-loader-4-line spin" />
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="admin-profile-page admin-profile-modal-overlay" role="dialog" aria-labelledby="profile-header">
      <Toast ref={toast} position="top-right" className="admin-profile-toast" />
      <Dialog
        header={<span><i className="ri-save-line admin-profile-dialog-header-icon" /> Confirmation de mise à jour du profil</span>}
        visible={showConfirmDialog}
        style={{ width: '32vw', maxWidth: '480px' }}
        onHide={cancelSave}
        className="admin-profile-dialog admin-profile-update-dialog"
        footer={
          <div className="admin-profile-dialog-footer">
            <button className="admin-profile-dialog-cancel" onClick={cancelSave} aria-label="Annuler la confirmation">
              <i className="ri-close-line" /> Annuler
            </button>
            <button className="admin-profile-dialog-confirm" onClick={confirmSave} aria-label="Confirmer les modifications">
              <i className="ri-check-line" /> Confirmer
            </button>
          </div>
        }
      >
        <div className="admin-profile-confirm-content">
          <i className="ri-save-line admin-profile-confirm-icon" />
          <h3 className="admin-profile-confirm-title">Confirmation de mise à jour</h3>
          <p className="admin-profile-confirm-message">Êtes-vous sûr de vouloir enregistrer les modifications à votre profil ?</p>
        </div>
      </Dialog>
      <Dialog
        header="Confirmation de changement de mot de passe"
        visible={showPasswordConfirmDialog}
        style={{ width: '32vw', maxWidth: '480px' }}
        onHide={cancelPasswordUpdate}
        className="admin-profile-dialog admin-profile-password-dialog"
        footer={
          <div className="admin-profile-dialog-footer">
            <button className="admin-profile-dialog-cancel" onClick={cancelPasswordUpdate} aria-label="Annuler la confirmation du mot de passe">
              <i className="ri-close-line" /> Annuler
            </button>
            <button className="admin-profile-dialog-confirm" onClick={confirmPasswordUpdate} aria-label="Confirmer le changement de mot de passe">
              <i className="ri-check-line" /> Confirmer
            </button>
          </div>
        }
      >
        <div className="admin-profile-confirm-content">
          <i className="ri-shield-keyhole-line admin-profile-confirm-icon" />
          <h3 className="admin-profile-confirm-title">Confirmation de mot de passe</h3>
          <p className="admin-profile-confirm-message">Êtes-vous sûr de vouloir modifier votre mot de passe ? Cette action est irréversible.</p>
        </div>
      </Dialog>

      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <h2 id="profile-header">
            <i className="ri-user-3-line" /> Profil de {adminData.nom} {adminData.prenom}
          </h2>
          <button
            className="admin-profile-close-btn"
            onClick={onClose}
            aria-label="Fermer la fenêtre du profil"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <div className="admin-profile-tabs">
          <button
            className={`admin-profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            aria-label="Ouvrir l'onglet Profil"
          >
            <i className="ri-user-line" /> Profil
          </button>
          <button
            className={`admin-profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
            aria-label="Ouvrir l'onglet Mot de passe"
          >
            <i className="ri-lock-password-line" /> Mot de passe
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="admin-profile-form-container">
            <div className="admin-profile-content">
              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-information-line" /> Informations personnelles
                </h3>
                <div className="admin-profile-image-section">
                  <div className="admin-profile-image-container">
                    {imagePreview || adminData.profileImage ? (
                      <img
                        src={imagePreview || adminData.profileImage}
                        alt={`Photo de profil de ${adminData.nom}`}
                        className="admin-profile-image"
                      />
                    ) : (
                      <div className="admin-profile-image-placeholder">
                        <i className="ri-user-3-line" />
                      </div>
                    )}
                    <label htmlFor="profileImage" className="admin-profile-image-label">
                      <i className="ri-camera-line" /> Changer la photo
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="admin-profile-image-input"
                      aria-label="Choisir une nouvelle photo de profil"
                    />
                  </div>
                </div>
                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="nom">
                      <i className="ri-text" /> Nom *
                    </label>
                    <InputText
                      id="nom"
                      name="nom"
                      value={adminData.nom}
                      onChange={handleInputChange}
                      placeholder="Nom"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="prenom">
                      <i className="ri-text" /> Prénom *
                    </label>
                    <InputText
                      id="prenom"
                      name="prenom"
                      value={adminData.prenom}
                      onChange={handleInputChange}
                      placeholder="Prénom"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="email">
                      <i className="ri-mail-line" /> Email *
                    </label>
                    <InputText
                      id="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemple.com"
                      type="email"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="cin">
                      <i className="ri-id-card-line" /> CIN *
                    </label>
                    <InputText
                      id="cin"
                      name="cin"
                      value={adminData.cin}
                      onChange={handleInputChange}
                      placeholder="Numéro CIN"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="dateDeNaissance">
                      <i className="ri-calendar-line" /> Date de naissance *
                    </label>
                    <Calendar
                      id="dateDeNaissance"
                      value={adminData.dateDeNaissance}
                      onChange={handleDateChange}
                      dateFormat="dd/mm/yy"
                      placeholder="Sélectionnez une date"
                      showIcon
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="genre">
                      <i className="ri-gender-line" /> Genre *
                    </label>
                    <Dropdown
                      id="genre"
                      name="genre"
                      value={adminData.genre}
                      options={genreOptions}
                      onChange={handleInputChange}
                      placeholder="Sélectionnez le genre"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="numéroDeTéléphone">
                      <i className="ri-phone-line" /> Numéro de téléphone *
                    </label>
                    <InputText
                      id="numéroDeTéléphone"
                      name="numéroDeTéléphone"
                      value={adminData.numéroDeTéléphone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      keyfilter="pnum"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="role">
                      <i className="ri-user-settings-line" /> Rôle *
                    </label>
                    <Dropdown
                      id="role"
                      name="role"
                      value={adminData.role}
                      options={roleOptions}
                      onChange={handleInputChange}
                      placeholder="Sélectionnez le rôle"
                      required
                      aria-required="true"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-map-pin-line" /> Adresse
                </h3>
                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="adresse">
                      <i className="ri-home-line" /> Adresse *
                    </label>
                    <InputText
                      id="adresse"
                      name="adresse"
                      value={adminData.adresse}
                      onChange={handleInputChange}
                      placeholder="Adresse"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="ville">
                      <i className="ri-city-line" /> Ville *
                    </label>
                    <InputText
                      id="ville"
                      name="ville"
                      value={adminData.ville}
                      onChange={handleInputChange}
                      placeholder="Ville"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="pays">
                      <i className="ri-earth-line" /> Pays *
                    </label>
                    <InputText
                      id="pays"
                      name="pays"
                      value={adminData.pays}
                      onChange={handleInputChange}
                      placeholder="Pays"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="codePostal">
                      <i className="ri-mail-line" /> Code postal *
                    </label>
                    <InputText
                      id="codePostal"
                      name="codePostal"
                      value={adminData.codePostal}
                      onChange={handleInputChange}
                      placeholder="Code postal"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-shield-check-line" /> Statut
                </h3>
                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="estActif">
                      <i className="ri-checkbox-circle-line" /> Statut *
                    </label>
                    <Dropdown
                      id="estActif"
                      name="estActif"
                      value={adminData.estActif}
                      options={estActifOptions}
                      onChange={handleInputChange}
                      placeholder="Sélectionnez le statut"
                      required
                      aria-required="true"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-key-2-line" /> Licences
                </h3>
                <DataTable
                  value={adminData.license}
                  className="admin-profile-license-table"
                  emptyMessage="Aucune licence trouvée"
                  aria-label="Tableau des licences"
                >
                  <Column field="id" header="ID Licence" />
                  <Column field="nom" header="Nom" />
                  <Column field="type" header="Type" />
                  <Column
                    field="dateExpiration"
                    header="Date d'expiration"
                    body={(rowData) =>
                      rowData.dateExpiration
                        ? new Date(rowData.dateExpiration).toLocaleDateString('fr-FR')
                        : 'Non définie'
                    }
                  />
                </DataTable>
              </div>

              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-time-line" /> Métadonnées
                </h3>
                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="crééLe">
                      <i className="ri-calendar-check-line" /> Créé le
                    </label>
                    <InputText
                      id="crééLe"
                      name="crééLe"
                      value={new Date(adminData.crééLe).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="admin-profile-form-group">
                    <label htmlFor="misÀJourLe">
                      <i className="ri-calendar-check-line" /> Mis à jour le
                    </label>
                    <InputText
                      id="misÀJourLe"
                      name="misÀJourLe"
                      value={new Date(adminData.misÀJourLe).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-profile-footer">
              <button
                type="button"
                className="admin-profile-cancel-btn"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Annuler les modifications"
              >
                <i className="ri-close-line" /> Annuler
              </button>
              <button
                type="submit"
                className="admin-profile-save-btn"
                disabled={isLoading || !isModified}
                aria-label="Enregistrer les modifications"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line" /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="admin-profile-form-container">
            <div className="admin-profile-content">
              <div className="admin-profile-section">
                <h3 className="admin-profile-section-title">
                  <i className="ri-shield-keyhole-line" /> Changer le mot de passe
                </h3>
                <div className="admin-profile-password-grid">
                  <div className="admin-profile-custom-password-field">
                    <label htmlFor="currentPassword">Mot de passe actuel</label>
                    <div className="admin-profile-input-wrapper">
                      <InputText
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Mot de passe actuel"
                        required
                        aria-required="true"
                        aria-describedby="current-password-error"
                      />
                      <button
                        type="button"
                        className="admin-profile-password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Masquer le mot de passe actuel' : 'Afficher le mot de passe actuel'}
                      >
                        <i className={showCurrentPassword ? 'ri-eye-off-2-line' : 'ri-eye-2-line'} />
                      </button>
                    </div>
                  </div>
                  <div className="admin-profile-custom-password-field">
                    <label htmlFor="newPassword">Nouveau mot de passe</label>
                    <div className="admin-profile-input-wrapper">
                      <InputText
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nouveau mot de passe"
                        required
                        aria-required="true"
                        aria-describedby="new-password-error"
                      />
                      <button
                        type="button"
                        className="admin-profile-password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                      >
                        <i className={showNewPassword ? 'ri-eye-off-2-line' : 'ri-eye-2-line'} />
                      </button>
                    </div>
                    {passwordError && (
                      <small className="admin-profile-error-message" id="new-password-error" role="alert">
                        <i className="ri-alert-line" /> {passwordError}
                      </small>
                    )}
                    {passwordStrength && (
                      <div className="admin-profile-strength-indicator">
                        <div className="admin-profile-strength-bar">
                          <div className={`admin-profile-strength-fill ${passwordStrength.toLowerCase()}`} />
                        </div>
                        <span className={`admin-profile-strength-text ${passwordStrength.toLowerCase()}`}>
                          Force : {passwordStrength}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="admin-profile-custom-password-field">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <div className="admin-profile-input-wrapper">
                      <InputText
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirmer le mot de passe"
                        required
                        aria-required="true"
                        aria-describedby="confirm-password-error"
                      />
                      <button
                        type="button"
                        className="admin-profile-password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}
                      >
                        <i className={showConfirmPassword ? 'ri-eye-off-2-line' : 'ri-eye-2-line'} />
                      </button>
                    </div>
                    {passwordMismatch && (
                      <small className="admin-profile-error-message" id="confirm-password-error" role="alert">
                        <i className="ri-alert-line" /> Les mots de passe ne correspondent pas
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-profile-footer">
              <button
                type="button"
                className="admin-profile-cancel-btn"
                onClick={() => setActiveTab('profile')}
                disabled={isLoading}
                aria-label="Retour à l'onglet Profil"
              >
                <i className="ri-arrow-left-line" /> Retour
              </button>
              <button
                type="submit"
                className="admin-profile-save-btn"
                disabled={isLoading || passwordMismatch || !passwordData.currentPassword || !passwordData.newPassword || passwordError}
                aria-label="Mettre à jour le mot de passe"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line" /> Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;