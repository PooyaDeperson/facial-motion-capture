import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

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
    <div className="fixed bottom-5 left-5 z-50">
      <div
        className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden 
        ${expanded ? "p-5 w-72" : "p-2 w-14 h-14 flex items-center justify-center cursor-pointer"}`}
        onClick={() => !expanded && setExpanded(true)}
      >
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        )}

        <div
          className={`grid gap-3 transition-all ${
            expanded ? "grid-cols-3" : "grid-cols-1"
          }`}
        >
          {colors.map((color) => (
            <div
              key={color.hex}
              onClick={() => setActiveColor(color.hex)}
              className={`w-10 h-10 rounded-xl cursor-pointer shadow-md border-2 transition 
                ${
                  activeColor === color.hex
                    ? "border-black scale-110"
                    : "border-transparent"
                }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorSwitcher;
