import React from "react";
export interface Column<T = any> {
    key: string;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
}
export interface TableProps<T = any> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
}
export declare function Table<T = any>({ data, columns, emptyMessage }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Table.d.ts.map