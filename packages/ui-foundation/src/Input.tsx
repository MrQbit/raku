import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  const inputId = React.useId();
  
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {label && (
        <label htmlFor={inputId} style={{ 
          fontSize: "14px", 
          fontWeight: "500", 
          color: "var(--rku-color-fg)" 
        }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
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
          ...props.style
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
          e.target.style.borderColor = "#3b82f6";
          props.onFocus?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
          e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
          props.onBlur?.(e);
        }}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}
