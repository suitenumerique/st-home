import PropTypes from 'prop-types';
import { useState } from 'react';
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";

const MapButton = ({ onClick, children, customStyle, expandable, expandedButtons, arrowPosition = 'right', tooltip }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        setShowButtons(true);
      }, 100);
    } else {
      setShowButtons(false);
      setTimeout(() => {
        setIsExpanded(false);
      }, 100);
    }
  };

  const handleButtonClick = (buttonOnClick) => {
    if (buttonOnClick) {
      buttonOnClick();
    }
    setShowButtons(false);
    setTimeout(() => {
      setIsExpanded(false);
    }, 100);
  };

  const renderArrow = () => {
    if (!expandable) return null;

    return (
      <div 
        style={{
          background: '#ffffff',
          color: 'var(--text-title-blue-france)',
          border: '1px solid #C6C6C6',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          cursor: 'pointer',
          padding: '0',
          margin: '0',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px 0 rgba(0,0,145,0.05)',
        }}
        onClick={handleExpandClick}
        title="Expand options"
      >
        <span style={{
          transition: 'transform 0.3s ease',
          ...(isExpanded && { transform: 'rotate(180deg)' })
        }} className="fr-icon-arrow-left-s-line" aria-hidden="true"></span> 
      </div>
    );
  };

  const renderExpandedButtons = () => {
    if (!expandable || !isExpanded || !showButtons || !expandedButtons) return null;

    const containerStyle = {
      display: 'flex',
      flexDirection: 'row',
      boxShadow: '0 6px 18px 0 rgba(0,0,145,0.05)',
      animation: 'fadeIn 0.3s ease-out',
    };

    return (
      <div style={containerStyle}>
        {expandedButtons.map((button, index) => (
          <Tooltip kind="hover" title={button.tooltip} key={index}>
            <button
              onClick={() => handleButtonClick(button.onClick)}
              style={{
                background: '#ffffff',
                color: 'var(--text-title-blue-france)',
                border: '1px solid #C6C6C6',
                borderRight: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                padding: '10px',
                margin: '0',
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                ...button.style
              }}
              title={button.label}
            >
              {button.content || button.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {renderArrow()}
      {renderExpandedButtons()}
      <Tooltip kind="hover" title={tooltip}>
        <button
          onClick={onClick}
          style={{
            background: '#ffffff',
            color: 'var(--text-title-blue-france)',
            border: '1px solid #C6C6C6',
            borderRadius: expandable ? '0 4px 4px 0' : '4px',
            cursor: 'pointer',
            padding: '10px',
            margin: '0',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px 0 rgba(0,0,145,0.05)',
            position: 'relative',
            ...customStyle
          }}
        >
          {children}
        </button>
      </Tooltip>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

MapButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  customStyle: PropTypes.object,
  expandable: PropTypes.bool,
  expandedButtons: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    icon: PropTypes.node,
    content: PropTypes.node,
    tooltip: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object
  })),
  arrowPosition: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  tooltip: PropTypes.string,
};

export default MapButton;