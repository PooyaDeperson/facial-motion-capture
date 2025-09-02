import React, { useEffect, useState } from "react";

// Define the color options
const colors = [
  { name: "Default", hex: "#fafafa" },
  { name: "Light Blue", hex: "#add8e6" },
  { name: "Lavender", hex: "#e6e6fa" },
  { name: "Mint", hex: "#98ff98" },
  { name: "Peach", hex: "#ffdab9" },
];

const ColorSwitcher: React.FC = () => {
  const [activeColor, setActiveColor] = useState<string>(colors[0].hex);

  // On component mount, set default body background
  useEffect(() => {
    document.body.style.backgroundColor = activeColor;
  }, [activeColor]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-6">
      {colors.map((color) => (
        <div
          key={color.hex}
          onClick={() => setActiveColor(color.hex)}
          className={`cursor-pointer rounded-2xl shadow-md p-4 flex flex-col items-center justify-center transition border-2 duration-200 
            ${activeColor === color.hex ? "border-black scale-105" : "border-transparent"}`}
          style={{ backgroundColor: color.hex }}
        >
          <span className="text-sm font-medium bg-white/60 px-2 py-1 rounded-md">
            {color.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ColorSwitcher;
