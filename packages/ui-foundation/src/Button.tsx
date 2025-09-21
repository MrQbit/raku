import React from "react";
export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        cursor: "pointer",
        fontFamily: "var(--rku-font-sans)"
      }}
    >
      {children}
    </button>
  );
}
