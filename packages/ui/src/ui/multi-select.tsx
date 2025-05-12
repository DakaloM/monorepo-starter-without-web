'use client';

import { Check, X, ChevronsUpDown } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState } from 'react';

import { cn } from '../lib';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../ui';

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (update: string[]) => void;
  className?: string;
  icon?: JSX.Element;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  icon,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleUnselect = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: string) => {
    e.stopPropagation();

    onChange(selected.filter((i) => i !== item));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} {...props}>
      <Button
        variant="outline"
        role="combobox"
        type="button"
        aria-expanded={open}
        className={`w-full z-0 relative hover:bg-transparent justify-between ${
          selected.length > 1 ? 'h-auto' : 'h-10'
        }`}
        onClick={() => setOpen(true)}
      >
        {icon && <div className="absolute left-3">{icon}</div>}
        {!selected.length && props.placeholder && (
          <span className={cn('text-muted-foreground', icon && 'pl-6')}>{props.placeholder}</span>
        )}

        <div className={cn('flex gap-1 flex-wrap z-10', icon && 'pl-6')}>
          {selected.map((item) => (
            <Badge variant="outline" key={item} className="mr-1 mb-1">
              {options.find((o) => o.value === item)?.label ?? item}
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
                onClick={(e) => handleUnselect(e, item)}
                role="button"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      <DropdownMenuTrigger asChild>
        <div />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-0">
        <Command className={className}>
          <CommandInput placeholder="Search ..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    selected.includes(option.value)
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  );
                  setOpen(true);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.includes(option.value) ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
