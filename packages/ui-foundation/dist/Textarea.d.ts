import React from "react";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    className?: string;
}
export declare function Textarea({ label, error, className, ...props }: TextareaProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Textarea.d.ts.map