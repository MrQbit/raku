import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ children, ...props }) {
    return (_jsx("button", { ...props, style: {
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontFamily: "var(--rku-font-sans)"
        }, children: children }));
}
