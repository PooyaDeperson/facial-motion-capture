import { useEffect, useState, useRef, ReactNode } from "react";

/**
 * Option type for dropdown
 */
export type Option = {
  label: string;           // Text shown in the dropdown
  value: string;           // Internal value
  icon?: ReactNode;        // Optional icon shown on the left
};

/**
 * Props for the CustomDropdown component
 */
interface CustomDropdownProps {
  options: Option[];               // List of dropdown options
  value: string | null;            // Currently selected value
  onChange: (value: string) => void; // Callback when a new value is selected
  placeholder?: string;            // Placeholder text if no value is selected
}

/**
 * CustomDropdown
 * Fully reusable dropdown component
 * Features:
 * - Optional icons on the left for each option
 * - Click outside to close
 * - Selected value displayed on button
 * - Fully styled and reusable
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Track dropdown open/close
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for click outside detection

  /**
   * Close dropdown when clicking outside
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
    onChange(val);   // Notify parent
    setIsOpen(false); // Close dropdown
  };

  // Find the label of the selected value
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="cd-container relative w-60" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        className="cd-button w-full px-4 py-2 border rounded bg-white text-left flex justify-between items-center hover:border-blue-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
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
              <div className="flex items-center space-x-2">
                {/* Optional icon on the left */}
                {option.icon && <span className="cd-icon">{option.icon}</span>}

                {/* Label */}
                <span>{option.label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
