"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "./skeletons";

// The standard list surface: every future list uses DataTable (or a card
// grid) — no bespoke tables. Columns with sortValue get client sorting.
export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  empty,
}: {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty: React.ReactNode;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return data;
    const sv = col.sortValue;
    return [...data].sort((a, b) => {
      const va = sv(a);
      const vb = sv(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    });
  }, [data, sort, columns]);

  if (loading) return <SkeletonTable rows={5} cols={columns.length} />;
  if (data.length === 0) return <>{empty}</>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={col.className}
              aria-sort={
                sort?.key === col.key
                  ? sort.dir === 1
                    ? "ascending"
                    : "descending"
                  : undefined
              }
            >
              {col.sortValue ? (
                <button
                  type="button"
                  onClick={() =>
                    setSort((s) =>
                      s?.key === col.key
                        ? { key: col.key, dir: s.dir === 1 ? -1 : 1 }
                        : { key: col.key, dir: 1 },
                    )
                  }
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground",
                    sort?.key === col.key && "text-foreground",
                  )}
                >
                  {col.header}
                  {sort?.key === col.key ? (
                    sort.dir === 1 ? (
                      <ArrowUp className="size-3.5" aria-hidden />
                    ) : (
                      <ArrowDown className="size-3.5" aria-hidden />
                    )
                  ) : (
                    <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
                  )}
                </button>
              ) : (
                col.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
