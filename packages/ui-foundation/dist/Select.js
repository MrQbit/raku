import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export function Select({ label, error, options, placeholder, ...props }) {
    const selectId = React.useId();
    return (_jsxs("div", { style: { display: "grid", gap: 4 }, children: [label && (_jsx("label", { htmlFor: selectId, style: {
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--rku-color-fg)"
                }, children: label })), _jsxs("select", { id: selectId, ...props, style: {
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
                }, onFocus: (e) => {
                    e.target.style.borderColor = "#3b82f6";
                    props.onFocus?.(e);
                }, onBlur: (e) => {
                    e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
                    props.onBlur?.(e);
                }, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), error && (_jsx("span", { style: { fontSize: "12px", color: "#ef4444" }, children: error }))] }));
}
//# sourceMappingURL=Select.js.map