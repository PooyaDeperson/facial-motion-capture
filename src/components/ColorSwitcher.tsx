import React, { useEffect, useState, useRef } from "react";

// Colors
const colors = [
  { hex: "#add8e6" },
  { hex: "#e6e6fa" },
  { hex: "#98ff98" },
  { hex: "#ffdab9" },
  { hex: "#ffffff" },
];

// Patterns (dummy background patterns as CSS gradients or shapes)
const patterns = [
  { name: "None", value: "" },
  { name: "Stripes", value: "repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, transparent 10px, transparent 20px)" },
  { name: "Dots", value: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)" },
  { name: "Diagonal", value: "repeating-linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, transparent 10px, transparent 20px)" },
  { name: "Grid", value: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)" },
  { name: "Waves", value: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 25%, transparent 26%)" },
  { name: "Checker", value: "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%)" },
  { name: "Crosshatch", value: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 5px, transparent 5px, transparent 10px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 5px, transparent 5px, transparent 10px)" },
  { name: "Waves2", value: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 5px, transparent 5px, transparent 10px)" },
];

// Helper for text contrast
const isDark = (hex: string) => {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 128;
};

const ColorPatternSwitcher: React.FC = () => {
  const [activeColor, setActiveColor] = useState<string>(() => localStorage.getItem("activeColor") || colors[0].hex);
  const [activePattern, setActivePattern] = useState<string>(() => localStorage.getItem("activePattern") || "");
  const [expandedTab, setExpandedTab] = useState<"color" | "pattern" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.transition = "background 0.5s ease";
    document.body.style.backgroundColor = activeColor;
    document.body.style.backgroundImage = activePattern;
    document.body.style.color = isDark(activeColor) ? "white" : "black";
    localStorage.setItem("activeColor", activeColor);
    localStorage.setItem("activePattern", activePattern);
  }, [activeColor, activePattern]);

  // Close expanded tab if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="main-container" ref={containerRef}>
      <div className="segmented-control">
        <button
          className={`tab-button ${expandedTab === "color" ? "active" : ""}`}
          onClick={() => setExpandedTab(expandedTab === "color" ? null : "color")}
        >
          🎨
        </button>
        <button
          className={`tab-button ${expandedTab === "pattern" ? "active" : ""}`}
          onClick={() => setExpandedTab(expandedTab === "pattern" ? null : "pattern")}
        >
          ▓
        </button>
      </div>

      {expandedTab === "color" && (
        <div className="selector-container color-container">
          {colors.map((color) => (
            <div
              key={color.hex}
              onClick={() => setActiveColor(color.hex)}
              className={`color-card ${activeColor === color.hex ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      )}

      {expandedTab === "pattern" && (
        <div className="selector-container pattern-container">
          {patterns.map((pattern) => (
            <div
              key={pattern.name}
              onClick={() => setActivePattern(pattern.value)}
              className={`pattern-card ${activePattern === pattern.value ? "selected" : ""}`}
            >
              {pattern.name}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .main-container {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 140px;
          z-index: 50;
        }

        .segmented-control {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .tab-button {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          border: none;
          background: #fff;
          cursor: pointer;
          font-size: 24px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }

        .tab-button:hover {
          transform: scale(1.05);
        }

        .tab-button.active {
          background: #e5e5e5;
        }

        .selector-container {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 12px;
          display: grid;
          gap: 10px;
        }

        .color-container {
          grid-template-columns: repeat(3, 1fr);
        }

        .color-card {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
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

        .pattern-container {
          grid-template-columns: 1fr;
        }

        .pattern-card {
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          text-align: center;
          transition: background 0.2s ease, border 0.2s ease;
        }

        .pattern-card:hover {
          background: #f0f0f0;
        }

        .pattern-card.selected {
          border: 2px solid #000;
          background: #e5e5e5;
        }
      `}</style>
    </div>
  );
};

export default ColorPatternSwitcher;
