import { useEffect, useState, useRef, ReactNode } from "react";

/**
 * Option type for dropdown
 */
export type Option = {
  label: string; // Text shown in the dropdown
  value: string; // Internal value
  leftIcon?: ReactNode; // Optional icon shown on the left
  rightIcon?: ReactNode; // Optional icon shown on the right
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
 */
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Handle selecting an option
  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Find the selected option
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        className="camera-dropdown post-rel flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Left icon */}
        <span className="has-icon left-side camera-icon dimmed">{selectedOption?.leftIcon}</span>

        {/* Label */}
        <span className="dropdown-text">{selectedOption?.label || placeholder || "Select an option"}</span>

        {/* Right icon (dropdown arrow) */}
        <span
          className={`has-icon right-side dropdown-icon ${
            isOpen ? "rotated-180" : ""
          }`}
        ></span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul className="pos-rel camera-dropdown-list-container top-0 left-0">
          {options.map((option) => (
            <li key={option.value} className="camera-dropdown-list-item">
              <button
                type="button"
                className={`flex items-center justify-between w-full gap-2 ${
                  value === option.value ? "cd-selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {/* Left icon */}
                <span className="has-icon left-side camera-icon dimmed">{option.leftIcon}</span>

                {/* Label */}
                <span className="dropdown-text">{option.label}</span>

                {/* Right icon — only visible for the selected option */}
                <span className="has-icon right-side dropdown-icon">
                  {value === option.value ? option.rightIcon : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
