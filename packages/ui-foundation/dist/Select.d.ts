import React from "react";
export interface SelectOption {
    value: string;
    label: string;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}
export declare function Select({ label, error, options, placeholder, ...props }: SelectProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Select.d.ts.map