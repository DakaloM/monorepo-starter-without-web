'use client';

import { Address } from '@num/client';

import { RefreshCwIcon, MapIcon } from 'lucide-react';
import { useState } from 'react';

import { useGoogleAutoComplete, Prediction } from '../hooks';
import { Input } from './input';

export function LocationInput({ onSelectLocation, placeholder, value }: LocationInputProps) {
  const [search, setSearch] = useState(value);
  const { debounceSearch, list, setList, selectPredictionLocation, isLoading } =
    useGoogleAutoComplete();

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length < 2) {
      setList([]);

      return;
    }

    debounceSearch(value);
  };

  const handleSelect = async (prediction: Prediction) => {
    try {
      const location = await selectPredictionLocation(prediction);

      onSelectLocation(location);
      setList([]);
      setSearch(location.text);
    } catch (error) {
      console.error({ error });
    }
  };

  const icon = isLoading ? (
    <div className="animate-spin">
      <RefreshCwIcon />
    </div>
  ) : (
    <MapIcon />
  );

  return (
    <div className="relative col-span-2">
      <div id="dummy-google-component" />
      <Input
        type="search"
        placeholder={placeholder ?? 'Search for your location...'}
        onChange={(e) => handleSearch(e.target.value)}
        value={search}
        required
      />
      {Boolean(list.length) && (
        <ul className="absolute shadow-md w-full flex flex-col gap-2 rounded-md p-4 bg-white z-10 dark:bg-gray-900">
          {list.map((prediction, i) => (
            <li key={i} className="flex w-full">
              <button
                type="button"
                onClick={() => handleSelect(prediction)}
                className="group w-full float-left hover:scale-110 flex gap-4 text-sm"
              >
                <span className="whitespace-normal">{prediction.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
interface LocationInputProps {
  onSelectLocation: (location: Address) => void;
  placeholder?: string;
  value?: string;
}
