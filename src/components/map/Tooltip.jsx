import React, { useState, useEffect } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), 200);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  useEffect(() => {
    const styleId = 'tooltip-arrow-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .tooltip-with-arrow {
          position: relative;
        }
        
        /* Top position - arrow points down */
        .tooltip-with-arrow.position-top::before,
        .tooltip-with-arrow.position-top::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
        .tooltip-with-arrow.position-top::before {
          border-top: 7px solid #ddd;
          z-index: 1;
        }
        .tooltip-with-arrow.position-top::after {
          border-top: 6px solid #fff;
          margin-top: -1px;
          z-index: 2;
        }
        
        /* Bottom position - arrow points up */
        .tooltip-with-arrow.position-bottom::before,
        .tooltip-with-arrow.position-bottom::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
        .tooltip-with-arrow.position-bottom::before {
          border-bottom: 7px solid #ddd;
          z-index: 1;
        }
        .tooltip-with-arrow.position-bottom::after {
          border-bottom: 6px solid #fff;
          margin-bottom: -1px;
          z-index: 2;
        }
        
        /* Left position - arrow points right */
        .tooltip-with-arrow.position-left::before,
        .tooltip-with-arrow.position-left::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
        }
        .tooltip-with-arrow.position-left::before {
          border-left: 7px solid #ddd;
          z-index: 1;
        }
        .tooltip-with-arrow.position-left::after {
          border-left: 6px solid #fff;
          margin-left: -1px;
          z-index: 2;
        }
        
        /* Right position - arrow points left */
        .tooltip-with-arrow.position-right::before,
        .tooltip-with-arrow.position-right::after {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
        }
        .tooltip-with-arrow.position-right::before {
          border-right: 7px solid #ddd;
          z-index: 1;
        }
        .tooltip-with-arrow.position-right::after {
          border-right: 6px solid #fff;
          margin-right: -1px;
          z-index: 2;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'absolute',
      zIndex: 1000,
      padding: '8px 12px',
      color: 'var(--text-color)',
      backgroundColor: '#fff',
      borderRadius: '0',
      pointerEvents: 'none',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
      whiteSpace: 'nowrap',
      maxWidth: 'min(24rem, calc(66.66667vw - 1.33333rem))',
      display: 'block',
      fontSize: '.75rem',
      lineHeight: '1.25rem',
      filter: 'drop-shadow(0 0 10px rgba(0, 0, 18, 0.16))',
    };

    const positionStyles = {
      top: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
        borderBottom: '1px solid #ddd',
      },
      bottom: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '8px',
        borderTop: '1px solid #ddd',
      },
      left: {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '8px',
        borderRight: '1px solid #ddd',
      },
      right: {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
        borderLeft: '1px solid #ddd',
      }
    };

    return { ...baseStyle, ...positionStyles[position] };
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className={className}
    >
      {children}
      {content && (
        <span 
          style={getTooltipStyle()}
          className={`tooltip-with-arrow position-${position}`}
        >
          {content}
        </span>
      )}
    </div>
  );
};

export default Tooltip;