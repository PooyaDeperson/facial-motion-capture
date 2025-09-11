import React, { useEffect, useState, useRef } from "react";

// Colors
const colors = [
  { hex: "#ffde98ff" },
  { hex: "#f1a2f1ff" },
  { hex: "#98ff98" },
  { hex: "#ffc693ff" },
  { hex: "#8bd9fbff" },
  { hex: "#ffffff" },
];

// Patterns (using CSS variables for background patterns)
const patterns = [
  { name: "None", value: "var(--pattern-none)" },
  { name: "Stripes", value: "var(--pattern-stripes)" },
  { name: "Waves", value: "var(--pattern-waves)" },
  { name: "Checker", value: "var(--pattern-checker)" },
  { name: "Crosshatch", value: "var(--pattern-crosshatch)" },
  { name: "Waves2", value: "var(--pattern-waves2)" },
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
  const [activeColor, setActiveColor] = useState<string>(
    () => localStorage.getItem("activeColor") || colors[0].hex
  );
  const [activePattern, setActivePattern] = useState<string>(
    () => localStorage.getItem("activePattern") || ""
  );
  const [expandedTab, setExpandedTab] = useState<"color" | "pattern" | null>(
    null
  );
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
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpandedTab(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
            <div
          className="popup-container selector-container cc-pattern-selector-container pos-abs bottom-0 p-1 left-0 z-7 m-6 br-24"
          ref={containerRef}
        >
          <div className="bg-blur flex-row cc-pattern-selector pos-abs bottom-0 left-0 z-7 m-3 gap-2 br-16 p-1">
            <button
              className={`icon-holder br-12 tab-button ${
                expandedTab === "color" ? "active" : ""
              }`}
              onClick={() =>
                setExpandedTab(expandedTab === "color" ? null : "color")
              }
            >
              {expandedTab === "color" && (
                <>
                  {/* Right icon — only visible for the selected option */}
                  <span className="has-icon icon-size-32"></span>
                </>
              )}
            </button>

            <button
              className={`icon-holder br-12 tab-button ${
                expandedTab === "pattern" ? "active" : ""
              }`}
              onClick={() =>
                setExpandedTab(expandedTab === "pattern" ? null : "pattern")
              }
            >
              {expandedTab === "pattern" && (
                <>
                  {/* Right icon — only visible for the selected option */}
                  <span className="has-icon icon-size-32"></span>
                </>
              )}
            </button>
          </div>
        </div>


      {expandedTab === "color" && (
        <div className="p-4 br-24 pb-86 selector-inner-container inner-container selector-container color-container">
          {colors.map((color) => (
            <div
              key={color.hex}
              onClick={() => setActiveColor(color.hex)}
              className={`icon-holder color-card br-16 color-${color.hex.replace(
                "#",
                ""
              )} ${activeColor === color.hex ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      )}

      {expandedTab === "pattern" && (
        <div className="p-4 br-24 pb-86 selector-inner-container inner-container selector-container pattern-container">
          {patterns.map((pattern) => (
            <div
              key={pattern.name}
              onClick={() => setActivePattern(pattern.value)}
              className={`icon-holder pattern-card br-16 pattern-${pattern.name
                .toLowerCase()
                .replace(/\s+/g, "-")} ${
                activePattern === pattern.value ? "selected" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPatternSwitcher;
