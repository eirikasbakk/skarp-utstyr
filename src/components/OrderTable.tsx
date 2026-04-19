"use client";
import { useEffect, useRef, useCallback } from "react";
import type { Article } from "@/lib/types";

export interface RowData {
  _id: string;
  article_id: number;
  size: string;
  print_name: string;
  print_number: string;
  quantity: number;
}

interface Props {
  articles: Article[];
  rows: RowData[];
  onChange: (rows: RowData[]) => void;
}

let _uid = 0;
export function newRow(article_id: number): RowData {
  return { _id: String(++_uid), article_id, size: "", print_name: "", print_number: "", quantity: 1 };
}

const FILL_FIELDS: { field: keyof RowData; label: string }[] = [
  { field: "size", label: "Størrelse" },
  { field: "print_name", label: "Navn (trykk)" },
  { field: "print_number", label: "Nummer (trykk)" },
];

export default function OrderTable({ articles, rows, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const articleMap = Object.fromEntries(articles.map((a) => [a.id, a]));
  const articleOptions = Object.fromEntries(
    articles.map((a) => [a.id, `${a.name} (${a.article_number})`])
  );

  const syncRows = useCallback(() => {
    if (!tabRef.current) return;
    onChangeRef.current(tabRef.current.getData() as RowData[]);
  }, []);

  const fillDown = useCallback(
    (field: keyof RowData) => {
      if (!tabRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tRows: any[] = tabRef.current.getRows();
      if (tRows.length < 2) return;
      const firstVal = tRows[0].getData()[field];
      if (firstVal === "" || firstVal === undefined) return;
      tRows.slice(1).forEach((row) => row.update({ [field]: firstVal }));
      syncRows();
    },
    [syncRows]
  );

  useEffect(() => {
    if (!containerRef.current || articles.length === 0) return;

    import("tabulator-tables").then(({ TabulatorFull: Tabulator }) => {
      if (!containerRef.current) return;
      if (tabRef.current) { tabRef.current.destroy(); tabRef.current = null; }

      tabRef.current = new Tabulator(containerRef.current!, {
        data: rows,
        layout: "fitColumns",
        reactiveData: false,
        tabEndNewRow: () => newRow(articles[0].id),
        validationMode: "highlight",
        columns: [
          {
            title: "Artikkel",
            field: "article_id",
            editor: "list",
            editorParams: { values: articleOptions, autocomplete: true, clearable: false },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (cell: any) => articleMap[cell.getValue()]?.name ?? "—",
            minWidth: 180,
            validator: "required",
            cellEdited: (cell: { getRow: () => { update: (d: Record<string, unknown>) => void } }) => {
              cell.getRow().update({ size: "" });
              syncRows();
            },
          },
          {
            title: "Størrelse",
            field: "size",
            editor: "list",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            editorParams: (cell: any) => {
              const article = articleMap[cell.getRow().getData().article_id];
              if (!article || article.sizes.length === 0) return { values: [] };
              return { values: article.sizes };
            },
            width: 110,
            cellEdited: syncRows,
          },
          {
            title: "Navn (trykk)",
            field: "print_name",
            editor: "input",
            cellEdited: syncRows,
          },
          {
            title: "Nummer (trykk)",
            field: "print_number",
            editor: "input",
            width: 145,
            validator: [
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: (cell: any) => !cell.getValue() || /^\d{1,3}$/.test(cell.getValue()),
                parameters: {},
              },
            ],
            cellEdited: syncRows,
          },
          {
            title: "Antall",
            field: "quantity",
            editor: "number",
            editorParams: { min: 1, max: 999 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validator: ["required", "min:1"] as any,
            width: 80,
            hozAlign: "center" as const,
            cellEdited: syncRows,
          },
          {
            title: "",
            field: "_id",
            width: 40,
            hozAlign: "center" as const,
            headerSort: false,
            formatter: () => `<span class="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none select-none">×</span>`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cellClick: (_e: Event, cell: any) => {
              cell.getRow().delete();
              syncRows();
            },
          },
        ],
      });
    });

    return () => { if (tabRef.current) { tabRef.current.destroy(); tabRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

  // Push new rows into Tabulator when parent adds them
  useEffect(() => {
    if (!tabRef.current) return;
    const current: RowData[] = tabRef.current.getData();
    const currentIds = new Set(current.map((r: RowData) => r._id));
    const added = rows.filter((r) => !currentIds.has(r._id));
    if (added.length > 0) tabRef.current.addData(added);
  }, [rows]);

  if (articles.length === 0) {
    return <p className="text-sm text-gray-400 italic">Ingen artikler i katalogen ennå.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Fyll ned fra første rad:</span>
        {FILL_FIELDS.map(({ field, label }) => (
          <button
            key={field}
            type="button"
            onClick={() => fillDown(field)}
            className="px-2 py-1 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
          >
            ↓ {label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="border rounded overflow-hidden text-sm" />
      <p className="text-xs text-gray-400">Tab hopper til neste celle. Siste kolonne → ny rad automatisk.</p>
    </div>
  );
}
