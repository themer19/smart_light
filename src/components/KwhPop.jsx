import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Knob } from 'primereact/knob';

const KnobPopup = () => {
  const [visible, setVisible] = useState(true);
  const [value, setValue] = useState(50);
  
  const primaryColor = '#45fc25';
  const primaryColorLight = '#a8ff9a';
  const primaryColorDark = '#2bd60a';
  const headerGradient = 'linear-gradient(135deg, #6a11cb 0%, #45fc25 100%)';

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
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
              Données énergétiques
            </span>
          </div>
          <button 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
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
            onClick={() => setVisible(false)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <i className="ri-close-line" style={{ fontSize: '1.25rem' }} />
          </button>
        </div>
      } 
      visible={visible} 
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
      onHide={() => setVisible(false)}
      closable={false}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6B7280',
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
            {value} <span style={{ fontSize: '1rem', color: '#6B7280' }}>kWh</span>
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
            valueStyle={{ fontSize: '24px', fontWeight: '600' }}
            unit="kWh"
            unitStyle={{ 
              fontSize: '12px', 
              color: '#6B7280',
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
              color: '#6B7280',
              marginBottom: '0.5rem'
            }}>
              <i className="ri-sensor-line" style={{ marginRight: '0.5rem' }} />
              Capteurs actifs
            </p>
            <p style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1F2937',
              margin: 0
            }}>
              8
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
              color: '#6B7280',
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
            onClick={() => setVisible(false)}
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