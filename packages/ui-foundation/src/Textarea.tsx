import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  const textareaId = React.useId();
  
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {label && (
        <label htmlFor={textareaId} style={{ 
          fontSize: "14px", 
          fontWeight: "500", 
          color: "var(--rku-color-fg)" 
        }}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
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
          resize: "vertical",
          minHeight: "80px",
          ...props.style
        }}
        onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
          e.target.style.borderColor = "#3b82f6";
          props.onFocus?.(e);
        }}
        onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
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
