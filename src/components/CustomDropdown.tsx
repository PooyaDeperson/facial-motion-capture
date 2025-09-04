import { useEffect, useState, useRef, ReactNode } from "react";

/**
 * Option type for dropdown
 */
export type Option = {
  label: string; // Text shown in the dropdown
  value: string; // Internal value
  icon?: ReactNode; // Optional icon shown on the left
};

/**
 * Props for the CustomDropdown component
 */
interface CustomDropdownProps {
  options: Option[]; // List of dropdown options
  value: string | null; // Currently selected value
  onChange: (value: string) => void; // Callback when a new value is selected
  placeholder?: string; // Placeholder text if no value is selected
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    onChange(val); // Notify parent
    setIsOpen(false); // Close dropdown
  };

  // Find the label of the selected value
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
<div className="" ref={dropdownRef}>
  {/* Dropdown button */}
  <button
    type="button"
    className="camera-dropdown post-rel flex items-center justify-between"
    onClick={() => setIsOpen(!isOpen)}
  >
    {/* Left icon */}
    <span className="has-icon left-side dropdown-icon"></span>

    {/* Label */}
    <span className="mx-2">
      {selectedLabel || placeholder || "Select an option"}
    </span>

    {/* Right icon */}
    <span
      className={`${
        isOpen
          ? "has-icon right-side dropdown-icon rotated-180"
          : "has-icon right-side dropdown-icon"
      }`}
    ></span>
  </button>
</div>


      {/* Dropdown list */}
      {isOpen && (
        <ul className="pos-rel camera-dropdown-list-container top-0 left-0 m-1">
          {options.map((option) => (
            <li
              key={option.value}
              className={`pos-rel camera-dropdown-list-container top-0 left-0 m-1
                ${value === option.value ? "cd-selected" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex-row gap-2">
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
