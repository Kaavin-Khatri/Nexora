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
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

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
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty: React.ReactNode;
  onRowClick?: (row: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const reduceMotion = useReducedMotionSafe();

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

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={!reduceMotion ? { opacity: 0 } : false}
          animate={!reduceMotion ? { opacity: 1 } : false}
          exit={!reduceMotion ? { opacity: 0 } : false}
          transition={{ duration: 0.15 }}
        >
          <SkeletonTable rows={5} cols={columns.length} />
        </motion.div>
      ) : data.length === 0 ? (
        <motion.div
          key="empty"
          initial={!reduceMotion ? { opacity: 0 } : false}
          animate={!reduceMotion ? { opacity: 1 } : false}
          exit={!reduceMotion ? { opacity: 0 } : false}
          transition={{ duration: 0.15 }}
        >
          {empty}
        </motion.div>
      ) : (
        <motion.div
          key="table"
          initial={!reduceMotion ? { opacity: 0 } : false}
          animate={!reduceMotion ? { opacity: 1 } : false}
          exit={!reduceMotion ? { opacity: 0 } : false}
          transition={{ duration: 0.15 }}
        >
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
      <motion.tbody
        className="[&_tr:last-child]:border-0"
        initial={!reduceMotion ? "hidden" : false}
        animate={!reduceMotion ? "visible" : false}
        variants={{
          visible: { transition: { staggerChildren: 0.05 } }
        }}
      >
        <AnimatePresence mode="popLayout">
          {sorted.map((row) => (
            <motion.tr
              layout={!reduceMotion ? "position" : false}
              key={rowKey(row)}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
              }}
              exit={!reduceMotion ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0 }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b transition-colors data-[state=selected]:bg-muted",
                onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined
              )}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </AnimatePresence>
      </motion.tbody>
    </Table>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
