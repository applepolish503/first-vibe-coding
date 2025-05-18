import React from 'react';
import { theme } from '../styles/theme';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: theme.colors.background.secondary,
        padding: '24px',
        borderRadius: theme.common.borderRadius.lg,
        width: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: theme.common.shadow.lg,
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: theme.colors.text.primary,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: theme.common.borderRadius.sm,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          marginTop: 0,
          marginBottom: '24px',
          color: theme.colors.text.primary,
          borderBottom: `2px solid ${theme.colors.border.primary}`,
          paddingBottom: '12px',
        }}>
          Help
        </h2>

        {/* Disclaimer */}
        <div style={{
          backgroundColor: theme.colors.background.tertiary,
          padding: '16px',
          borderRadius: theme.common.borderRadius.md,
          marginBottom: '24px',
          border: `1px solid ${theme.colors.border.secondary}`,
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0',
            color: theme.colors.accent.blue,
          }}>
            Disclaimer
          </h3>
          <p style={{
            margin: 0,
            color: theme.colors.text.secondary,
            fontSize: '14px',
          }}>
            This is a demo application. It is not intended for use in production environments.
          </p>
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Views section */}
          <section>
            <h3 style={{
              color: theme.colors.text.primary,
              marginBottom: '12px',
            }}>
              Views
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div>
                <h4 style={{
                  color: theme.colors.accent.blue,
                  marginBottom: '8px',
                }}>
                  Flow View
                </h4>
                <p style={{
                  margin: 0,
                  color: theme.colors.text.secondary,
                }}>
                  Displays the logistics flow. Design the sequence from truck entry to exit.
                </p>
              </div>
              <div>
                <h4 style={{
                  color: theme.colors.accent.purple,
                  marginBottom: '8px',
                }}>
                  Physical View
                </h4>
                <p style={{
                  margin: 0,
                  color: theme.colors.text.secondary,
                }}>
                  Displays the logistics site layout. Design the placement of facilities and equipment.
                </p>
              </div>
            </div>
          </section>

          {/* Operations section */}
          <section>
            <h3 style={{
              color: theme.colors.text.primary,
              marginBottom: '12px',
            }}>
              Basic Operations
            </h3>
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Double-click on a flow block to assign physical blocks to it
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Multiple flow blocks can share the same physical block
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Drag and drop blocks in each view to adjust their positions
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Connect blocks to create flows and routes
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Press the Delete key while hovering over a block to remove it
              </li>
            </ul>
          </section>

          {/* File operations section */}
          <section>
            <h3 style={{
              color: theme.colors.text.primary,
              marginBottom: '12px',
            }}>
              File Operations
            </h3>
            <p style={{
              margin: '0 0 12px 0',
              color: theme.colors.text.secondary,
            }}>
              You can save and load the following three files:
            </p>
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Flow View design data
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Physical View design data
              </li>
              <li style={{
                color: theme.colors.text.secondary,
              }}>
                • Block relationship data
              </li>
            </ul>
            <p style={{
              margin: '12px 0 0 0',
              color: theme.colors.text.secondary,
              fontSize: '14px',
            }}>
              You can upload all three files simultaneously to restore your complete workspace.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 