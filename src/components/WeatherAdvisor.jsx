import React, { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCalendar, FiThermometer, FiInfo, FiX, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm } from 'weather-icons-react';
import Sidebar from '../components/Sidebar';
import './WeatherAdvisor.css';

const WeatherAdvisor = () => {
  const [date, setDate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const getWeatherIcon = (weatherType) => {
    const size = 48;
    switch (weatherType.toLowerCase()) {
      case 'sunny':
        return <WiDaySunny size={size} color="#F59E0B" />;
      case 'rain':
        return <WiRain size={size} color="#3B82F6" />;
      case 'cloudy':
        return <WiCloudy size={size} color="#64748B" />;
      case 'snow':
        return <WiSnow size={size} color="#E0E7FF" />;
      case 'storm':
        return <WiThunderstorm size={size} color="#7C3AED" />;
      default:
        return <WiDaySunny size={size} color="#F59E0B" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError('Veuillez sélectionner une date');
      toast.error('Veuillez sélectionner une date');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/predict', { date });
      setResult(response.data);
      toast.success('Conseil météo obtenu avec succès !');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la récupération des données météo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDate('');
    setResult(null);
    setError('');
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="weather-advisor-page">
      <div className="wa-container">
        <Sidebar
          onToggle={handleSidebarToggle}
          className={clsx({
            'wa-sidebar-open': sidebarOpen,
            'wa-sidebar-collapsed': !sidebarOpen,
          })}
        />
        <main
          className={clsx('wa-main-content', {
            'wa-sidebar-collapsed': !sidebarOpen || isMobile,
          })}
        >
          <div className="wa-card">
            <div className="wa-header">
              <div className="wa-title-wrapper">
                <div className="wa-title-icon-container">
                  <div className="wa-weather-gradient-icon">
                    <WiDaySunny size={32} color="white" />
                  </div>
                </div>
                <div>
                  <h1 className="wa-main-title">
                    Smart Weather Advisor
                    <span className="wa-title-underline"></span>
                  </h1>
                  <p className="wa-subtitle">
                    Prévisions météorologiques intelligentes pour une meilleure planification
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="wa-form">
              <div className="wa-form-group">
                <label htmlFor="date" className="wa-form-label">
                  <FiCalendar className="wa-form-icon" />
                  Sélectionnez une date
                </label>
                <div className="wa-input-box">
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="wa-input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {date && (
                    <FiX
                      className="wa-clear-icon"
                      onClick={handleClear}
                      aria-label="Effacer la date"
                    />
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="wa-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="wa-spinner"></span>
                ) : (
                  <>
                    <FiSearch />
                    Obtenir les prévisions
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="wa-status-badge wa-error">
                <FiAlertTriangle className="wa-error-icon" />
                <span>{error}</span>
              </div>
            )}

            {result && !error && (
              <div className="wa-result-container">
                <div className="wa-weather-header">
                  <div className="wa-weather-icon">
                    {getWeatherIcon(result.weatherType || 'sunny')}
                  </div>
                  <div className="wa-weather-summary">
                    <h3 className="wa-weather-date">{result.date}</h3>
                    <p className="wa-weather-type">{result.weatherType || 'Ensoleillé'}</p>
                  </div>
                </div>

                <div className="wa-weather-details">
                  <div className="wa-weather-detail">
                    <FiThermometer className="wa-detail-icon" />
                    <div>
                      <p className="wa-detail-label">Température</p>
                      <p className="wa-detail-value">{result.temperature} °C</p>
                    </div>
                  </div>
                  
                  <div className="wa-weather-detail">
                    <FiInfo className="wa-detail-icon" />
                    <div>
                      <p className="wa-detail-label">Conseil</p>
                      <p className="wa-detail-value wa-advice">{result.conseil}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName="wa-toast"
          progressClassName="wa-toast-progress"
        />
      </div>
    </div>
  );
};

export default WeatherAdvisor;