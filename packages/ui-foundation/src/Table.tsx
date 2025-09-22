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

export function Table<T = any>({ data, columns, emptyMessage = "No data available" }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div style={{
        padding: "var(--rku-space-3)",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "14px"
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: "var(--rku-radius)",
      overflow: "hidden"
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "var(--rku-font-sans)"
      }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: "12px var(--rku-space-2)",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--rku-color-fg)",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              style={{
                borderBottom: index < data.length - 1 ? "1px solid #f3f4f6" : "none"
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: "12px var(--rku-space-2)",
                    fontSize: "14px",
                    color: "var(--rku-color-fg)"
                  }}
                >
                  {column.render 
                    ? column.render((item as any)[column.key], item)
                    : (item as any)[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
