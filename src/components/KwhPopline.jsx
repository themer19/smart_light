import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Knob } from 'primereact/knob';
import 'primeicons/primeicons.css';

const KnobPopup = ({ line, onClose }) => {
  const [value, setValue] = useState(350);
  
  const primaryColor = '#0EA5E9';
  const primaryColorLight = '#62C2EF';
  const primaryColorDark = '#0284C7';
  const headerGradient = 'linear-gradient(135deg, #6a11cb 0%, #0EA5E9 100%)';
  const gris = '#FFFFFF33';
  const grisLight = '#FFFFFF1A';

  if (!line) return null;

  return (
    <Dialog 
      header={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: gris,
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="ri-flashlight-line" style={{ color: '#fff', fontSize: '1.25rem' }} />
            </div>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#fff',
              letterSpacing: '0.025em'
            }}>
              Données énergétiques: {line.nom_L}
            </span>
          </div>
          <button 
            style={{ 
              background: grisLight,
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} 
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.background = gris}
            onMouseLeave={(e) => e.currentTarget.style.background = grisLight}
            aria-label="Fermer"
          >
            <i className="ri-close-line" style={{ fontSize: '1.25rem' }} />
          </button>
        </div>
      } 
      visible={true} 
      style={{ 
        width: '520px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }} 
      headerStyle={{ 
        background: headerGradient,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        padding: 0,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }} 
      contentStyle={{
        padding: '1.5rem'
      }}
      onHide={onClose}
      closable={false}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ 
            fontSize: '1rem', 
            color: primaryColor,
            marginBottom: '0.5rem'
          }}>
            Consommation électrique actuelle
          </p>
          <p style={{ 
            fontSize: '2.25rem', 
            fontWeight: '600',
            color: primaryColor,
            margin: '0.5rem 0'
          }}>
            {value} <span style={{ fontSize: '1rem', color: primaryColor }}>kWh</span>
          </p>
        </div>

        <div style={{ margin: '2rem 0' }}>
          <Knob 
            value={value} 
            min={0} 
            max={300} 
            size={180}
            onChange={(e) => setValue(e.value)} 
            valueColor={primaryColor}
            rangeColor={primaryColorLight}
            strokeWidth={10}
            valueTemplate={`${value}`}
            valueStyle={{ fontSize: '24px', fontWeight: '600', color: primaryColor }}
            unit="kWh"
            unitStyle={{ 
              fontSize: '12px', 
              color: primaryColor,
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '0.875rem',
              color: primaryColor,
              marginBottom: '0.5rem'
            }}>
              <i className="ri-sensor-line" style={{ marginRight: '0.5rem' }} />
              Poteaux associes
            </p>
            <p style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1F2937',
              margin: 0
            }}>
              10
            </p>
          </div>

          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '0.875rem',
              color: primaryColor,
              marginBottom: '0.5rem'
            }}>
              <i className="ri-temp-cold-line" style={{ marginRight: '0.5rem' }} />
              Température
            </p>
            <p style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1F2937',
              margin: 0
            }}>
              24°C
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            style={{
              backgroundColor: primaryColor,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColorDark}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
          >
            <i className="ri-check-line" style={{ marginRight: '0.5rem' }} />
            Valider
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default KnobPopup;