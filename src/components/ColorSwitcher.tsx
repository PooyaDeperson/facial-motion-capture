import React, { useEffect, useState } from "react";

// Define the color options
const colors = [
  { hex: "#add8e6" }, // Light Blue default
  { hex: "#e6e6fa" }, // Lavender
  { hex: "#98ff98" }, // Mint
  { hex: "#ffdab9" }, // Peach
  { hex: "#ffffff" }, // White (optional, not default)
];

// Helper to check brightness for text contrast
const isDark = (hex: string) => {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 128;
};

const ColorSwitcher: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeColor, setActiveColor] = useState<string>(() => {
    return localStorage.getItem("activeColor") || colors[0].hex;
  });

  useEffect(() => {
    document.body.style.transition = "background-color 0.5s ease";
    document.body.style.backgroundColor = activeColor;
    document.body.style.color = isDark(activeColor) ? "white" : "black";
    localStorage.setItem("activeColor", activeColor);
  }, [activeColor]);

  return (
    <div className="color-switcher">
      <div
        className={`switcher-container ${expanded ? "expanded" : "collapsed"}`}
        onClick={() => !expanded && setExpanded(true)}
      >
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="close-button"
          >
            ✕
          </button>
        )}

        <div className={`colors-grid ${expanded ? "expanded-grid" : "collapsed-grid"}`}>
          {colors.map((color) => (
            <div
              key={color.hex}
              onClick={() => setActiveColor(color.hex)}
              className={`color-card ${activeColor === color.hex ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .color-switcher {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 50;
        }

        .switcher-container {
          position: relative;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .switcher-container.collapsed {
          width: 56px;
          height: 56px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .switcher-container.expanded {
          width: 280px;
          padding: 20px;
        }

        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #e5e5e5;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .close-button:hover {
          background: #d4d4d4;
        }

        .colors-grid {
          display: grid;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .colors-grid.collapsed-grid {
          grid-template-columns: 1fr;
        }

        .colors-grid.expanded-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .color-card {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 2px solid transparent;
          transition: transform 0.2s ease, border 0.2s ease;
        }

        .color-card:hover {
          transform: scale(1.05);
        }

        .color-card.selected {
          border: 2px solid #000;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ColorSwitcher;
