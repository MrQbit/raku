import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ children, size = "medium", ...props }) {
    const sizeStyles = {
        sm: { padding: "6px 10px", fontSize: "12px" },
        small: { padding: "6px 10px", fontSize: "12px" },
        medium: { padding: "10px 14px", fontSize: "14px" },
        md: { padding: "10px 14px", fontSize: "14px" },
        large: { padding: "14px 18px", fontSize: "16px" },
        lg: { padding: "14px 18px", fontSize: "16px" }
    };
    return (_jsx("button", { ...props, style: {
            ...sizeStyles[size],
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontFamily: "var(--rku-font-sans)",
            ...props.style
        }, children: children }));
}
//# sourceMappingURL=Button.js.map