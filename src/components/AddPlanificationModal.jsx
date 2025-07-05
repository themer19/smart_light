import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { toast } from 'react-toastify';
import axios from 'axios';
import './AddPlanificationModal.css';

const AddPlanificationModal = ({ onClose, onSave, initialData }) => {
  const [planData, setPlanData] = useState({
    site: '',
    ligne: '',
    timeSlots: [{ startTime: new Date(0, 0, 0, 18, 0), endTime: new Date(0, 0, 0, 6, 0), intensity: 50 }],
    frequence: 'Quotidien',
    mode: 'Manuel',
    statut: 'Activé',
    repetition: false,
    saison: '',
  });
  const [siteOptions, setSiteOptions] = useState([]);
  const [ligneOptions, setLigneOptions] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingLignes, setLoadingLignes] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const toastConfig = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
    zIndex: 99999,
  };

  const fetchSites = async () => {
    setLoadingSites(true);
    try {
      const response = await axios.get('http://localhost:5000/api/site/allsite');
      const sites = response.data.map((site) => ({
        label: site.nom,
        value: site._id,
      }));
      setSiteOptions(sites);
      if (!planData.site && sites.length > 0 && !initialData) {
        setPlanData((prev) => ({ ...prev, site: sites[0].value }));
      }
      if (sites.length === 0) {
        toast.warn('Aucun site disponible.', toastConfig);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des sites.', toastConfig);
      console.error('Fetch sites error:', error);
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchLignes = async () => {
    setLoadingLignes(true);
    try {
      const response = await axios.get('http://localhost:5000/api/ligne');
      const lignes = response.data.map((ligne) => ({
        label: ligne.nom_L,
        value: ligne._id,
      }));
      setLigneOptions(lignes);
      if (!planData.ligne && lignes.length > 0 && !initialData) {
        setPlanData((prev) => ({ ...prev, ligne: lignes[0].value }));
      }
      if (lignes.length === 0) {
        toast.warn('Aucune ligne disponible.', toastConfig);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des lignes.', toastConfig);
      console.error('Fetch lignes error:', error);
    } finally {
      setLoadingLignes(false);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchLignes();
    if (initialData) {
      setPlanData({
        site: initialData.site?._id || '',
        ligne: initialData.ligne?._id || '',
        timeSlots: initialData.timeSlots?.length
          ? initialData.timeSlots.map((slot) => ({
              startTime: slot.startTime ? new Date(slot.startTime) : new Date(0, 0, 0, 18, 0),
              endTime: slot.endTime ? new Date(slot.endTime) : new Date(0, 0, 0, 6, 0),
              intensity: slot.intensity || 50,
            }))
          : [
              {
                startTime: initialData.heureDebut ? new Date(initialData.heureDebut) : new Date(0, 0, 0, 18, 0),
                endTime: initialData.heureFin ? new Date(initialData.heureFin) : new Date(0, 0, 0, 6, 0),
                intensity: initialData.intensite || 50,
              },
            ],
        frequence: initialData.frequence || 'Quotidien',
        mode: initialData.mode || 'Manuel',
        statut: initialData.statut || 'Activé',
        repetition: initialData.repetition || false,
        saison: initialData.saison || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target || e;
    setPlanData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTimeChange = (type, value, index) => {
    const time = value ? new Date(`1970-01-01T${value}:00Z`) : null;
    setPlanData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [type]: time } : slot
      ),
    }));
  };

  const handleIntensityChange = (value, index) => {
    let intensity = parseInt(value);
    if (isNaN(intensity)) intensity = 50;
    intensity = Math.max(10, Math.min(100, intensity));
    setPlanData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, intensity } : slot
      ),
    }));
  };

  const handleSeasonalTime = (saison) => {
    const seasonalTimes = {
      Hiver: { startTime: new Date(0, 0, 0, 18, 0), endTime: new Date(0, 0, 0, 6, 0) },
      Printemps: { startTime: new Date(0, 0, 0, 19, 0), endTime: new Date(0, 0, 0, 5, 0) },
      Été: { startTime: new Date(0, 0, 0, 20, 0), endTime: new Date(0, 0, 0, 5, 0) },
      Automne: { startTime: new Date(0, 0, 0, 19, 0), endTime: new Date(0, 0, 0, 6, 0) },
    };
    const times = seasonalTimes[saison] || {};
    setPlanData((prev) => ({
      ...prev,
      saison,
      timeSlots: [{ startTime: times.startTime, endTime: times.endTime, intensity: prev.timeSlots[0].intensity }],
    }));
    setSelectedSlotIndex(0);
  };

  const addTimeSlot = () => {
    if (planData.timeSlots.length >= 4) {
      toast.warn('Maximum 4 plages horaires par planification.', toastConfig);
      return;
    }
    setPlanData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: new Date(0, 0, 0, 18, 0), endTime: new Date(0, 0, 0, 6, 0), intensity: 50 }],
    }));
    setSelectedSlotIndex(planData.timeSlots.length);
  };

  const removeTimeSlot = (index) => {
    if (planData.timeSlots.length === 1) {
      toast.warn('Au moins une plage horaire est requise.', toastConfig);
      return;
    }
    setPlanData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
    setSelectedSlotIndex(Math.max(0, Math.min(selectedSlotIndex, planData.timeSlots.length - 2)));
  };

  const validateTimeSlots = (slots) => {
    for (let i = 0; i < slots.length; i++) {
      const { startTime, endTime, intensity } = slots[i];
      if (!startTime || !endTime) {
        return 'Toutes les plages horaires doivent avoir un début et une fin.';
      }
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      if (startMinutes >= endMinutes) {
        return "L'heure de fin doit être après l'heure de début pour chaque plage.";
      }
      if (intensity < 10 || intensity > 100) {
        return "L'intensité doit être entre 10% et 100% pour chaque plage.";
      }
      for (let j = i + 1; j < slots.length; j++) {
        const other = slots[j];
        if (!other.startTime || !other.endTime) continue;
        const otherStartMinutes = other.startTime.getHours() * 60 + other.startTime.getMinutes();
        const otherEndMinutes = other.endTime.getHours() * 60 + other.endTime.getMinutes();
        if (
          (startMinutes < otherEndMinutes && endMinutes > otherStartMinutes) ||
          (otherStartMinutes < endMinutes && otherEndMinutes > startMinutes)
        ) {
          return 'Les plages horaires ne doivent pas se chevaucher.';
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!planData.site && !planData.ligne) {
      toast.error('Veuillez sélectionner un site ou une ligne.', toastConfig);
      return;
    }
    if (planData.mode === 'Manuel') {
      const error = validateTimeSlots(planData.timeSlots);
      if (error) {
        toast.error(error, toastConfig);
        return;
      }
    }
    if (planData.mode === 'Saisonnière' && !planData.saison) {
      toast.error('Veuillez sélectionner une saison.', toastConfig);
      return;
    }

    const payload = {
      site: planData.site || null,
      ligne: planData.ligne || null,
      timeSlots: planData.timeSlots.map((slot) => ({
        startTime: slot.startTime ? slot.startTime.toISOString() : null,
        endTime: slot.endTime ? slot.endTime.toISOString() : null,
        intensity: slot.intensity,
      })),
      frequence: planData.frequence,
      mode: planData.mode,
      statut: planData.statut,
      repetition: planData.repetition,
      saison: planData.saison,
    };

    try {
      let response;
      if (initialData && initialData._id) {
        response = await axios.put(`http://localhost:5000/api/planifications/${initialData._id}`, payload);
        toast.success('Planification modifiée avec succès !', toastConfig);
      } else {
        response = await axios.post('http://localhost:5000/api/planifications', payload);
        toast.success('Planification ajoutée avec succès !', toastConfig);
      }
      onSave(response.data);
      handleCancel();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'enregistrement de la planification.';
      toast.error(errorMessage, toastConfig);
      console.error('Error saving planification:', error);
    }
  };

  const handleCancel = () => {
    setPlanData({
      site: '',
      ligne: '',
      timeSlots: [{ startTime: new Date(0, 0, 0, 18, 0), endTime: new Date(0, 0, 0, 6, 0), intensity: 50 }],
      frequence: 'Quotidien',
      mode: 'Manuel',
      statut: 'Activé',
      repetition: false,
      saison: '',
    });
    setSelectedSlotIndex(0);
    onClose();
  };

  const frequenceOptions = [
    { label: 'Quotidien', value: 'Quotidien' },
    { label: 'Hebdomadaire', value: 'Hebdomadaire' },
    { label: 'Ponctuel', value: 'Ponctuel' },
  ];

  const modeOptions = [
    { label: 'Manuel', value: 'Manuel' },
    { label: 'Automatique', value: 'Automatique' },
    { label: 'Saisonnière', value: 'Saisonnière' },
    { label: 'Astronomique', value: 'Astronomique' },
  ];

  const saisonOptions = [
    { label: 'Hiver', value: 'Hiver' },
    { label: 'Printemps', value: 'Printemps' },
    { label: 'Été', value: 'Été' },
    { label: 'Automne', value: 'Automne' },
  ];

  const statutOptions = [
    { label: 'Activé', value: 'Activé' },
    { label: 'Désactivé', value: 'Désactivé' },
  ];

  const LinearTimePicker = ({ timeSlots, onTimeChange, onIntensityChange, onAddSlot, onRemoveSlot, selectedSlotIndex, onSelectSlot }) => {
    return (
      <div className="plan-time-picker-container">
        <div className="plan-time-slots-list">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className={`plan-time-slot-item ${index === selectedSlotIndex ? 'selected' : ''}`}
              onClick={() => onSelectSlot(index)}
            >
              <div className="time-inputs-row">
                <div className="time-input-group">
                  <label className="time-label">Début</label>
                  <input
                    type="time"
                    value={slot.startTime ? slot.startTime.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => onTimeChange('startTime', e.target.value, index)}
                    className="time-input"
                    aria-label="Heure de début"
                  />
                </div>
                <div className="time-input-group">
                  <label className="time-label">Fin</label>
                  <input
                    type="time"
                    value={slot.endTime ? slot.endTime.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => onTimeChange('endTime', e.target.value, index)}
                    className="time-input"
                    aria-label="Heure de fin"
                  />
                </div>
                <div className="time-input-group">
                  <label className="time-label">Intensité</label>
                  <div className="intensity-control">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={slot.intensity}
                      onChange={(e) => onIntensityChange(e.target.value, index)}
                      className="intensity-slider"
                      aria-label={`Intensité lumineuse ${slot.intensity}%`}
                    />
                    <div className="intensity-input-wrapper">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={slot.intensity}
                        onChange={(e) => onIntensityChange(e.target.value, index)}
                        className="intensity-number-input"
                        aria-label={`Saisir intensité lumineuse ${slot.intensity}%`}
                      />
                      <span className="intensity-unit">%</span>
                    </div>
                    <i className="pi pi-lightbulb" />
                  </div>
                </div>
                <button
                  className="plan-remove-slot-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSlot(index);
                  }}
                  aria-label="Supprimer la plage horaire"
                >
                  <i className="pi pi-trash" />
                </button>
              </div>
            </div>
          ))}
          <Button
            label="Ajouter une plage horaire"
            icon="pi pi-plus"
            className="p-button-outlined plan-add-slot-btn"
            onClick={onAddSlot}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="plan-modal-overlay">
      <div className="plan-modal-container">
        <div className="plan-modal-header">
          <div className="plan-header-content">
            <i className="ri-calendar-2-line plan-header-icon" />
            <h2>{initialData ? 'Modifier la Planification' : 'Nouvelle Planification'}</h2>
          </div>
          <button className="plan-close-btn" onClick={handleCancel} aria-label="Fermer">
            <i className="ri-close-line" />
          </button>
        </div>
        <div className="plan-modal-body">
          <div className="plan-form-grid">
            <div className="plan-form-group">
              <label className="plan-form-label">
                <i className="ri-building-2-line" /> Site
              </label>
              <Dropdown
                name="site"
                value={planData.site}
                options={[{ label: 'Sélectionner un site', value: '' }, ...siteOptions]}
                onChange={handleChange}
                placeholder={loadingSites ? 'Chargement...' : 'Sélectionner un site'}
                className="plan-form-dropdown"
                disabled={loadingSites}
                aria-label="Sélectionner un site"
              />
            </div>
            <div className="plan-form-group">
              <label className="plan-form-label">
                <i className="ri-lightbulb-line" /> Ligne
              </label>
              <Dropdown
                name="ligne"
                value={planData.ligne}
                options={[{ label: 'Sélectionner une ligne', value: '' }, ...ligneOptions]}
                onChange={handleChange}
                placeholder={loadingLignes ? 'Chargement...' : 'Sélectionner une ligne'}
                className="plan-form-dropdown"
                disabled={loadingLignes}
                aria-label="Sélectionner une ligne"
              />
            </div>
            <div className="plan-form-group">
              <label className="plan-form-label">
                <i className="ri-settings-3-line" /> Mode
              </label>
              <Dropdown
                name="mode"
                value={planData.mode}
                options={modeOptions}
                onChange={handleChange}
                className="plan-form-dropdown"
                aria-label="Sélectionner un mode"
              />
            </div>
            {planData.mode === 'Saisonnière' && (
              <div className="plan-form-group">
                <label className="plan-form-label">
                  <i className="ri-leaf-line" /> Saison
                </label>
                <Dropdown
                  name="saison"
                  value={planData.saison}
                  options={saisonOptions}
                  onChange={(e) => {
                    handleChange(e);
                    handleSeasonalTime(e.value);
                  }}
                  placeholder="Sélectionner une saison"
                  className="plan-form-dropdown"
                  aria-label="Sélectionner une saison"
                />
              </div>
            )}
            {planData.mode === 'Manuel' && (
              <div className="plan-form-group plan-time-picker-group">
                <label className="plan-form-label">
                  <i className="ri-time-line" /> Plages horaires
                </label>
                <LinearTimePicker
                  timeSlots={planData.timeSlots}
                  onTimeChange={handleTimeChange}
                  onIntensityChange={handleIntensityChange}
                  onAddSlot={addTimeSlot}
                  onRemoveSlot={removeTimeSlot}
                  selectedSlotIndex={selectedSlotIndex}
                  onSelectSlot={setSelectedSlotIndex}
                />
              </div>
            )}
            {(planData.mode === 'Saisonnière' || planData.mode === 'Astronomique') && (
              <div className="plan-form-group">
                <label className="plan-form-label">
                  <i className="ri-time-line" /> Plage horaire
                </label>
                <div className="plan-time-display">
                  <div className="time-display-item">
                    <span className="time-label">Début:</span>
                    <span className="time-value">
                      {planData.timeSlots[0]?.startTime?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) || '--:--'}
                    </span>
                  </div>
                  <div className="time-display-item">
                    <span className="time-label">Fin:</span>
                    <span className="time-value">
                      {planData.timeSlots[0]?.endTime?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) || '--:--'}
                    </span>
                  </div>
                  <div className="time-display-item">
                    <span className="time-label">Intensité:</span>
                    <span className="time-value">{planData.timeSlots[0]?.intensity || 50}%</span>
                  </div>
                </div>
                <div className="intensity-slider-container">
                  <label className="plan-form-label">Intensité</label>
                  <div className="intensity-control">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={planData.timeSlots[0]?.intensity || 50}
                      onChange={(e) => handleIntensityChange(e.target.value, 0)}
                      className="intensity-slider"
                      aria-label={`Intensité lumineuse ${planData.timeSlots[0]?.intensity || 50}%`}
                    />
                    <div className="intensity-input-wrapper">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={planData.timeSlots[0]?.intensity || 50}
                        onChange={(e) => handleIntensityChange(e.target.value, 0)}
                        className="intensity-number-input"
                        aria-label={`Saisir intensité lumineuse ${planData.timeSlots[0]?.intensity || 50}%`}
                      />
                      <span className="intensity-unit">%</span>
                    </div>
                    <i className="pi pi-lightbulb" />
                  </div>
                </div>
              </div>
            )}
            <div className="plan-form-group">
              <label className="plan-form-label">
                <i className="ri-repeat-line" /> Fréquence
              </label>
              <Dropdown
                name="frequence"
                value={planData.frequence}
                options={frequenceOptions}
                onChange={handleChange}
                className="plan-form-dropdown"
                aria-label="Sélectionner une fréquence"
              />
            </div>
            <div className="plan-form-group">
              <label className="plan-form-label">
                <i className="ri-checkbox-circle-line" /> Statut
              </label>
              <Dropdown
                name="statut"
                value={planData.statut}
                options={statutOptions}
                onChange={handleChange}
                className="plan-form-dropdown"
                aria-label="Sélectionner un statut"
              />
            </div>
            <div className="plan-form-group plan-checkbox-group">
              <Checkbox
                inputId="repetition"
                name="repetition"
                checked={planData.repetition}
                onChange={handleChange}
                className="plan-checkbox"
                aria-label="Répétition"
              />
              <label htmlFor="repetition" className="plan-checkbox-label">
                <i className="ri-refresh-line" /> Répétition
              </label>
            </div>
          </div>
        </div>
        <div className="plan-modal-footer">
          <Button
            label="Annuler"
            icon="pi pi-times"
            className="p-button-outlined plan-cancel-btn"
            onClick={handleCancel}
          />
          <Button
            label="Enregistrer"
            icon="pi pi-check"
            className="plan-submit-btn"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default AddPlanificationModal;