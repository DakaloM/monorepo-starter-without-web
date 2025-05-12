'use client';

import { Column } from '@tanstack/react-table';
import { ArrowUpDownIcon, ServerOffIcon, SortAscIcon, SortDescIcon, XIcon } from 'lucide-react';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }
  const sortDirectionIcon = {
    desc: SortDescIcon,
    asc: SortAscIcon,
  } as const;

  const sortDirection = column.getIsSorted();
  const SortIcon = sortDirection ? sortDirectionIcon[sortDirection] : null;

  return (
    <div className={'flex items-center space-x-2 ' + className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="sm"
            className="text-black -ml-3 h-8 data-[state=open]:bg-accent gap-2 group"
          >
            <span>{title}</span>
            {SortIcon && <SortIcon size={14} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem className="gap-2" onClick={() => column.toggleSorting(false)}>
            <SortAscIcon size={14} />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={() => column.toggleSorting(true)}>
            <SortDescIcon size={14} />
            Desc
          </DropdownMenuItem>
          {sortDirection && (
            <DropdownMenuItem className="gap-2" onClick={() => column.clearSorting()}>
              <XIcon size={14} />
              Clear
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
