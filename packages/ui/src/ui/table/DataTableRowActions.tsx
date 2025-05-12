'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '../dropdown-menu';

export interface DataTableRowActionsProps<T extends z.ZodObject<any, any>> {
  row: Row<T>;
  Edit?: ({ defaults }: any) => JSX.Element;
  custom?: {
    onClick: (row: z.infer<T>) => void;
    title: string;
    icon?: JSX.Element;
    condition: (row: z.infer<T>) => boolean;
  }[];
}

export function DataTableRowActions<T extends z.ZodObject<any, any>>({
  row,
  Edit,
  custom,
}: DataTableRowActionsProps<T>) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const values = row
    .getVisibleCells()
    .reduce((acc, cell) => ({ ...acc, [cell.column.id]: cell.getValue() }), {}) as z.infer<T>;

  return (
    <DropdownMenu>
      {showEditDialog && Edit && <Edit defaults={values} />}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {Boolean(Edit) && (
          <DropdownMenuItem onClick={() => setShowEditDialog((prev) => !prev)}>
            Edit
          </DropdownMenuItem>
        )}
        {custom
          ?.filter((item) => item.condition(values))
          .map((item) => (
            <DropdownMenuItem onClick={() => item.onClick(values)}>
              {item.title}
              <DropdownMenuShortcut>{item.icon && item.icon}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        {/* <DropdownMenuItem>
          Delete
          <DropdownMenuShortcut>
            <TrashIcon size={12} />
          </DropdownMenuShortcut>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
