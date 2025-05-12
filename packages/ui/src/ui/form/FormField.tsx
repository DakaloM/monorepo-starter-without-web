// eslint-disable-next-line no-restricted-imports
import type { Address } from '@num/client';
import { startCase } from '@num/utils';

import { Search } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useId, useState } from 'react';

import { Button } from '../button';
import { Checkbox as NativeCheckbox } from '../checkbox';
import { Input, InputProps } from '../input';
import { LocationInput as NativeLocationInput } from '../location-input';
import { MultiSelect as NativeMultiSelect } from '../multi-select';
import { FormLabel } from '../native-form';
import {
  Select as NativeSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../native-select';
import { FormFieldProps } from './Form';
import { Loader } from '../Loader';

function createCheckbox() {
  return function CreatedCheckbox(props: FormFieldProps<boolean>) {
    const id = useId();

    return (
      <section className="flex gap-2 my-auto">
        <NativeCheckbox
          {...(props as any)}
          checked={(props as any).value}
          onCheckedChange={(e) => props.onChange(Boolean(e))}
          id={id}
        />
        <FormLabel htmlFor={id}>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
      </section>
    );
  };
}

function createInput(inputProps: InputProps) {
  return function CreatedInput(props: FormFieldProps<string>) {
    return (
      <section className="flex flex-col gap-2">
        <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
        <Input {...props} {...inputProps} onChange={(e) => props.onChange(e.target.value)} />
      </section>
    );
  };
}

function createLocationInput() {
  return function CreatedInput(props: FormFieldProps<Address>) {
    return (
      <section className="flex flex-col gap-2">
        <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
        <NativeLocationInput
          {...props}
          value={props.initialValue?.text}
          onSelectLocation={(location) => props.onChange(location)}
        />
      </section>
    );
  };
}

function useSelectProps<T>(props: SelectProps<T>) {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFetchProps(props)) {
      setIsLoading(true);
      props
        .fetchOptions()
        .then(setOptions)
        .finally(() => setIsLoading(false));
    } else {
      setOptions(props.options);
    }
  }, []);

  return {
    options,
    isLoading,
  };
}

function createMultiSelect() {
  return function CreatedSelect(props: CreatedMultiSelectProps & SelectProps<string[]>) {
    const { onChange, onItemSelected } = props;
    const { options, isLoading } = useSelectProps(props);

    const handleChange = (selectedItems: string[]) => {
      onChange(selectedItems);
      if (onItemSelected) {
        onItemSelected(selectedItems);
      }
    };

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <section className="flex flex-col gap-2">
        <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
        <NativeMultiSelect
          {...props}
          options={options}
          selected={(props as any).value || []}
          placeholder="..."
          onChange={handleChange}
        />
      </section>
    );
  };
}

function createSelect() {
  return function CreatedSelect(props: CreatedSelectProps & SelectProps<string>) {
    const { options } = useSelectProps(props);

    const handleChange = (value: string) => {
      props.onChange(value); // Propagate the change
      if (props.setValue) {
        props.setValue(value); // Update the state using the provided setter
      }
    };

    return (
      <section className="flex flex-col gap-2">
        <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
        <NativeSelect
          onValueChange={handleChange}
          defaultValue={props.initialValue || (props as any).value}
        >
          <SelectTrigger>
            <div className="flex place-items-center gap-2">
              <SelectValue placeholder="..." />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[400px] overflow-y-auto">
            {options.map(({ value, label }) => (
              <SelectItem key={label} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </NativeSelect>
      </section>
    );
  };
}

function createSelectWithSearch() {
  return function CreatedSelect(props: CreatedSelectProps & SelectProps<string>) {
    const { options, isLoading } = useSelectProps(props);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);

    const handleChange = (value: string) => {
      props.onChange(value);
      if (props.setValue) {
        props.setValue(value);
      }
    };

    const handleSearch = () => {
      const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      setFilteredOptions(filteredOptions);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
    };

    useEffect(() => {
      if (filteredOptions.length === 0) {
        setFilteredOptions(options);
      }
    }, [filteredOptions, options]);

    return (
      <section className="flex flex-col gap-2">
        <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
        {
          isLoading ? <div className="flex place-items-center gap-2">
            <Loader className='w-8 h-8' />
          </div> :
        <NativeSelect
          onValueChange={handleChange}
          defaultValue={props.initialValue || (props as any).value}
        >
          <SelectTrigger>
            <div className="flex place-items-center gap-2">
              <SelectValue placeholder="..." />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-max">
            <div className="p-2 flex items-center gap-2">
              <input
                value={searchQuery}
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" p-2 border border-gray-300 rounded w-full"
                onKeyDown={handleInputKeyDown}
              />
              <Button variant="ghost" onClick={handleSearch}>
                <Search className="text-gray-500" />
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </NativeSelect>
        }
      </section>
    );
  };
}

function createSelectWithCheckbox() {
  return function CreatedSelectWithCheckbox(
    props: FormFieldProps<string[]> & SelectProps<string[]> & { checkboxLabel: string },
  ) {
    const { options } = useSelectProps(props);
    const [checked, setChecked] = useState(Boolean((props as any).value?.length));

    useEffect(() => {
      if (!checked) {
        props.onChange([]);
      }
    }, [checked]);

    return (
      <section className="flex flex-col gap-4">
        <CheckboxInput {...{ value: checked }} onChange={setChecked} label={props.checkboxLabel} />

        {checked && (
          <div className="flex flex-col gap-2">
            <FormLabel>{(props as any).label ?? startCase((props as any).name)}</FormLabel>
            <NativeMultiSelect
              {...props}
              options={options}
              selected={(props as any).value || []}
              placeholder="..."
              onChange={props.onChange}
            />
          </div>
        )}
      </section>
    );
  };
}

export const NumberInput = createInput({
  type: 'number',
});

export const TextInput = createInput({
  type: 'text',
});

export const TextAreaInput = createInput({
  type: 'textarea',
});

export const EmailInput = createInput({
  type: 'email',
});

export const DisabledInput = createInput({
  disabled: true,
  className: 'bg-gray-300',
});

export const PasswordInput = createInput({
  type: 'password',
});

export const DateInput = createInput({
  type: 'date',
});

export const SelectWithCheckboxInput = createSelectWithCheckbox();

export const CheckboxInput = createCheckbox();

function isFetchProps<T>(props: SelectProps<T>): props is SelectFetchProps<any> {
  return (props as any).fetchOptions !== undefined;
}

export const Select = createSelect();

export const SelectWithSearch = createSelectWithSearch();

export const MultiSelect = createMultiSelect();

export const LocationInput = createLocationInput();

export type Option = { label: string; value: string };

export type FetchOptions = () => Promise<Option[]>;

interface SelectFetchProps<T> {
  fetchOptions: FetchOptions;
}

interface SelectOptionProps<T> {
  options: Option[];
}

interface CreatedMultiSelectProps extends FormFieldProps<string[]> {
  onChange: (value: string[]) => void;
  onItemSelected?: Dispatch<SetStateAction<string[]>>;
}

export interface CreatedSelectProps extends FormFieldProps<string> {
  setValue?: React.Dispatch<React.SetStateAction<string>>;
}

type SelectProps<T> = SelectFetchProps<T> | SelectOptionProps<T>;
