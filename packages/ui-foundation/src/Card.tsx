import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, children, style, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "var(--rku-radius)",
        padding: "var(--rku-space-3)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        ...style
      }}
    >
      {title && (
        <h3 style={{
          margin: "0 0 var(--rku-space-2) 0",
          fontSize: "18px",
          fontWeight: "600",
          color: "var(--rku-color-fg)"
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
