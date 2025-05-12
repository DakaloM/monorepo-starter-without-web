'use client';

import { startCase } from '@num/utils';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { Badge } from '../badge';
import {
  Table as NativeTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../native-table';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import { DataTableRowActions, DataTableRowActionsProps } from './DataTableRowActions';

export function Table<T extends z.AnyZodObject>({
  schema,
  data,
  actions,
  onClick,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<z.infer<T>>[] = useMemo(() => {
    const cols = Object.keys(schema.shape)
      .map(
        (key) =>
          ({
            id: key,
            accessorKey: key,
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title={startCase(key)} />
            ),
            enableSorting: true,
            enableHiding: false,
          }) as ColumnDef<z.infer<T>>,
      )
      .map((col) => {
        if (col.id?.toLowerCase().includes('date') || col.id === 'createdAt') {
          col.cell = ({ row }) => {
            const dateString = row.original[col.id!];
            if (!dateString) {
              return null;
            }

            const date = new Date(dateString);

            return (
              <span>
                {new Intl.DateTimeFormat('en-ZA', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }).format(date)}
              </span>
            );
          };
        }

        if (col.id?.toLowerCase() === 'status') {
          col.cell = ({ row }) => {
            const status = row.original[col.id!];

            return (
              <Badge className={statusLookUp[status]} variant="outline">
                {status}
              </Badge>
            );
          };
        }

        if (col.id?.toLowerCase() === 'tags') {
          col.cell = ({ row }) => {
            const tags = row.original[col.id!] as { name: string; id: string; color: string }[];

            return (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    style={{ backgroundColor: tag.color }}
                    className="text-white"
                    variant="outline"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            );
          };
        }

        return col;
      });

    if (actions) {
      cols.push({
        id: 'actions',
        // @ts-ignore
        cell: ({ row }: DataTableRowActionsProps<T>) => {
          return <DataTableRowActions row={row} Edit={actions.Edit} custom={actions.custom} />;
        },
      });
    }

    return [
      {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
      },
      ...cols,
    ];
  }, [schema, actions]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-auto">
        <NativeTable className="w-full overflow-x-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-gray-300 text-black dark:bg-gray-800/90"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={
                        (cell.column.id !== 'actions' &&
                          onClick &&
                          'group-hover:bg-gray-400/10 cursor-pointer') ||
                        ''
                      }
                      onClick={() => cell.column.id !== 'actions' && onClick?.(row.getValue('id'))}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={Object.keys(schema).length} className="w-full h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </NativeTable>
      </div>
    </div>
  );
}
export interface DataTableProps<T extends z.AnyZodObject> {
  schema: T;
  data: Record<string | number | symbol, any>[];
  actions?: Pick<DataTableRowActionsProps<T>, 'Edit' | 'custom'>;
  onClick?: (id: string | number) => void;
}

const statusLookUp = {
  Open: 'bg-green-600 text-white',
  Closed: 'bg-primary text-white',
  Hearing: 'bg-green-200 text-black',
  Warning: 'bg-red-200 text-black',
  Meeting: 'bg-yellow-200 text-black',
} as Record<string, string>;
