import React from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    className?: string;
}
export declare function Input({ label, error, className, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Input.d.ts.map