import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "small" | "medium" | "md" | "large" | "lg";
}

export function Button({ children, size = "medium", ...props }: ButtonProps) {
  const sizeStyles = {
    sm: { padding: "6px 10px", fontSize: "12px" },
    small: { padding: "6px 10px", fontSize: "12px" },
    medium: { padding: "10px 14px", fontSize: "14px" },
    md: { padding: "10px 14px", fontSize: "14px" },
    large: { padding: "14px 18px", fontSize: "16px" },
    lg: { padding: "14px 18px", fontSize: "16px" }
  };

  return (
    <button
      {...props}
      style={{
        ...sizeStyles[size],
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        cursor: "pointer",
        fontFamily: "var(--rku-font-sans)",
        ...props.style
      }}
    >
      {children}
    </button>
  );
}
