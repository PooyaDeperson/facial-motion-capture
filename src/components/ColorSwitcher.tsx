import React, { useEffect, useState } from "react";

// Define the color options
const colors = [
  { name: "Default", hex: "#fafafa" },
  { name: "Light Blue", hex: "#add8e6" },
  { name: "Lavender", hex: "#e6e6fa" },
  { name: "Mint", hex: "#98ff98" },
  { name: "Peach", hex: "#ffdab9" },
];

// Helper to check brightness for text contrast
const isDark = (hex: string) => {
  const c = hex.substring(1); // strip #
  const rgb = parseInt(c, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b; // perceived brightness
  return luma < 128;
};

const ColorSwitcher: React.FC = () => {
  const [activeColor, setActiveColor] = useState<string>(() => {
    return localStorage.getItem("activeColor") || colors[0].hex;
  });

  // Apply color to body and persist it
  useEffect(() => {
    document.body.style.transition = "background-color 0.5s ease";
    document.body.style.backgroundColor = activeColor;
    document.body.style.color = isDark(activeColor) ? "white" : "black";
    localStorage.setItem("activeColor", activeColor);
  }, [activeColor]);

  // const resetColor = () => {
  //   setActiveColor(colors[0].hex);
  // };

  return (
    <div className="pos-abs z-7 bottom-0 left-0 m-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {colors.map((color) => (
          <div
            key={color.hex}
            onClick={() => setActiveColor(color.hex)}
            className={`cursor-pointer rounded-2xl shadow-md p-4 flex flex-col items-center justify-center transition border-2 duration-200 
              ${
                activeColor === color.hex
                  ? "border-black scale-105"
                  : "border-transparent"
              }`}
            style={{ backgroundColor: color.hex }}
          >
            <span className="text-sm font-medium bg-white/70 px-2 py-1 rounded-md">
              {color.name}
            </span>
          </div>
        ))}
      </div>
      {/* <button
        onClick={resetColor}
        className="px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition shadow-md w-fit"
      >
        Reset to Default
      </button> */}
    </div>
  );
};

export default ColorSwitcher;
