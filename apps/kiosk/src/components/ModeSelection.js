/**
 * ModeSelection Component - Stile CoreInWork
 * Selezione modalità operativa con design pulito
 */

import React from 'react';
import { IoQrCode, IoLockClosed, IoArrowForward } from 'react-icons/io5';

const ModeSelection = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'kiosk',
      title: 'Modalità Kiosk',
      description: 'Scanner QR per check-out rapido visitatori',
      icon: IoQrCode,
      color: '#10b981',
      bgColor: '#f0fdf4'
    },
    {
      id: 'full',
      title: 'Modalità Completa',
      description: 'Dashboard con autenticazione e gestione visite',
      icon: IoLockClosed,
      color: '#3b82f6',
      bgColor: '#eff6ff'
    }
  ];

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mode-card {
          background: white;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .mode-card:hover {
          border-color: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .mode-card:active {
          transform: translateY(0);
        }

        .arrow-icon {
          flex-shrink: 0;
          color: #999;
          transition: all 0.25s ease;
        }

        .mode-card:hover .arrow-icon {
          color: #1a1a1a;
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .mode-card {
            padding: 20px;
            gap: 16px;
          }
        }
      `}</style>

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <IoQrCode size={48} color="white" />
          </div>
          <h1 style={styles.title}>CoreVisitor Kiosk</h1>
          <p style={styles.subtitle}>Seleziona la modalità operativa</p>
        </div>

        <div style={styles.modesGrid}>
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className="mode-card"
                onClick={() => onSelectMode(mode.id)}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '12px',
                  backgroundColor: mode.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={36} color={mode.color} />
                </div>
                <div style={styles.modeContent}>
                  <h3 style={styles.modeTitle}>{mode.title}</h3>
                  <p style={styles.modeDescription}>{mode.description}</p>
                </div>
                <IoArrowForward size={24} className="arrow-icon" />
              </div>
            );
          })}
        </div>

        <div style={styles.footerInfo}>
          <p style={styles.footerText}>CoreSuite - Visitor Management System</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  header: {
    textAlign: 'center',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    background: '#1a1a1a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    margin: 0,
    fontWeight: '500',
  },
  modesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'fadeIn 0.5s ease-out',
  },
  modeContent: {
    flex: 1,
    minWidth: 0,
  },
  modeTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  modeDescription: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.5',
  },
  footerInfo: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },
  footerText: {
    color: '#999',
    fontSize: '13px',
    margin: 0,
  },
};

export default ModeSelection;
