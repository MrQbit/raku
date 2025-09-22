import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, ...props }: SelectProps) {
  const selectId = React.useId();
  
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {label && (
        <label htmlFor={selectId} style={{ 
          fontSize: "14px", 
          fontWeight: "500", 
          color: "var(--rku-color-fg)" 
        }}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        style={{
          padding: "10px 12px",
          borderRadius: "var(--rku-radius)",
          border: `1px solid ${error ? "#ef4444" : "#e5e7eb"}`,
          background: "#ffffff",
          fontSize: "14px",
          fontFamily: "var(--rku-font-sans)",
          outline: "none",
          transition: "border-color 0.2s",
          cursor: "pointer",
          ...props.style
        }}
        onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
          e.target.style.borderColor = "#3b82f6";
          props.onFocus?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
          e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
          props.onBlur?.(e);
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: "12px", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}
