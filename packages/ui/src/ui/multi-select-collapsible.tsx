'use client';

import { groupBy } from '@num/utils';

import { ChevronsUpDown } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState, useMemo } from 'react';

import { Button } from './button';
import { Checkbox } from './checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

type OptionType = {
  label: string;
  value: string;
  category: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
  className?: string;
  icon?: JSX.Element;
  placeholder?: string;
}

export function MultiSelectCollapsible({
  options,
  selected,
  onChange,
  className,
  icon,
  ...props
}: MultiSelectProps) {
  const { groupedOptions, groupedOptionKeys } = useMemo(() => {
    const groupedOptions = groupBy(options, 'category');

    return {
      groupedOptions,
      groupedOptionKeys: Object.keys(groupedOptions),
    };
  }, [options]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelected = (id: string, isSelected: boolean) => {
    if (isSelected) {
      return onChange([...selected, id]);
    }

    return onChange(selected.filter((i) => i !== id));
  };

  return (
    <>
      {groupedOptionKeys.map((key) => (
        <Collapsible
          key={key}
          open={selectedCategory === key}
          onOpenChange={() => setSelectedCategory((prev) => (prev === key ? null : key))}
          className="space-y-2"
        >
          <div className="flex items-center justify-between space-x-4 px-4 rounded-lg border">
            <h4 className="text-sm font-semibold">{key}</h4>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
                <span className="text-xs">
                  {groupedOptions[key].filter((o) => selected.includes(o.value)).length}/
                  {groupedOptions[key].length}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pl-4 space-y-2">
            <div className="grid gap-2 py-4">
              {groupedOptions[key].map((options) => (
                <div className="flex items-center gap-2" key={options.value}>
                  <Checkbox
                    id={options.value}
                    checked={selected.some((s) => s === options.value)}
                    onCheckedChange={(e) => handleSelected(options.value, Boolean(e))}
                  />
                  <label
                    htmlFor={options.value}
                    className="text-sm hover:bg-secondary/5 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {options.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </>
  );
}
