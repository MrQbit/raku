import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export function Input({ label, error, className = "", ...props }) {
    const inputId = React.useId();
    return (_jsxs("div", { style: { display: "grid", gap: 4 }, children: [label && (_jsx("label", { htmlFor: inputId, style: {
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--rku-color-fg)"
                }, children: label })), _jsx("input", { id: inputId, ...props, style: {
                    padding: "10px 12px",
                    borderRadius: "var(--rku-radius)",
                    border: `1px solid ${error ? "#ef4444" : "#e5e7eb"}`,
                    background: "#ffffff",
                    fontSize: "14px",
                    fontFamily: "var(--rku-font-sans)",
                    outline: "none",
                    transition: "border-color 0.2s",
                    ...props.style
                }, onFocus: (e) => {
                    e.target.style.borderColor = "#3b82f6";
                    props.onFocus?.(e);
                }, onBlur: (e) => {
                    e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
                    props.onBlur?.(e);
                } }), error && (_jsx("span", { style: { fontSize: "12px", color: "#ef4444" }, children: error }))] }));
}
