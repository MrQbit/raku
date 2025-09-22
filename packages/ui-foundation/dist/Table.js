import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Table({ data, columns, emptyMessage = "No data available" }) {
    if (data.length === 0) {
        return (_jsx("div", { style: {
                padding: "var(--rku-space-3)",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "14px"
            }, children: emptyMessage }));
    }
    return (_jsx("div", { style: {
            border: "1px solid #e5e7eb",
            borderRadius: "var(--rku-radius)",
            overflow: "hidden"
        }, children: _jsxs("table", { style: {
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--rku-font-sans)"
            }, children: [_jsx("thead", { children: _jsx("tr", { style: { background: "#f9fafb" }, children: columns.map((column) => (_jsx("th", { style: {
                                padding: "12px var(--rku-space-2)",
                                textAlign: "left",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "var(--rku-color-fg)",
                                borderBottom: "1px solid #e5e7eb"
                            }, children: column.label }, column.key))) }) }), _jsx("tbody", { children: data.map((item, index) => (_jsx("tr", { style: {
                            borderBottom: index < data.length - 1 ? "1px solid #f3f4f6" : "none"
                        }, children: columns.map((column) => (_jsx("td", { style: {
                                padding: "12px var(--rku-space-2)",
                                fontSize: "14px",
                                color: "var(--rku-color-fg)"
                            }, children: column.render
                                ? column.render(item[column.key], item)
                                : item[column.key] }, column.key))) }, index))) })] }) }));
}
//# sourceMappingURL=Table.js.map