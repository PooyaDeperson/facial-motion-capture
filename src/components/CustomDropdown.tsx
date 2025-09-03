import { useEffect, useState, useRef } from "react";

/**
 * Option type for dropdown
 */
export type Option = {
  label: string; // Text shown in dropdown
  value: string; // Internal value
};

/**
 * Props for the CustomDropdown component
 */
interface CustomDropdownProps {
  options: Option[];             // List of options to display
  value: string | null;          // Currently selected value
  onChange: (value: string) => void; // Callback when a new value is selected
  placeholder?: string;          // Placeholder text if no value is selected
}

/**
 * CustomDropdown
 * 
 * A fully reusable dropdown component without using native <select>.
 * Features:
 * - Custom styling
 * - Click outside to close
 * - Shows selected value
 * - Supports icons for selected option
 * - Fully reusable anywhere in your app
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Track if dropdown is open
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for click outside detection

  /**
   * Effect: Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Handle selecting an option
   */
  const handleSelect = (val: string) => {
    onChange(val);   // Notify parent of new selection
    setIsOpen(false); // Close dropdown
  };

  // Get the label of the selected value
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="cd-container relative w-60" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        className="cd-button w-full px-4 py-2 border rounded bg-white text-left flex justify-between items-center hover:border-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Show selected label or placeholder */}
        {selectedLabel || placeholder || "Select an option"}

        {/* Arrow icon */}
        <span
          className={`cd-arrow ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul className="cd-list absolute w-full border rounded bg-white mt-1 max-h-60 overflow-auto z-10 shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              className={`cd-list-item px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors duration-200
                ${value === option.value ? "cd-selected bg-blue-100 font-semibold" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex justify-between items-center">
                <span>{option.label}</span>
                {/* Show check icon if selected */}
                {value === option.value && <span className="text-blue-600">✔</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
