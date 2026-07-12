import { clsx } from "@/utils/clsx";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
  loading,
  className,
}: TableProps<T>) {
  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500",
                  col.width && `w-[${col.width}]`,
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-neutral-400"
              >
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "border-b border-neutral-100 transition-colors duration-100",
                  onRowClick && "cursor-pointer hover:bg-neutral-50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx("px-4 py-3 text-neutral-800", col.className)}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
