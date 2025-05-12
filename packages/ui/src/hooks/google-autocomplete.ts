import { Address } from '@num/client';

import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

const loader = new Loader({
  apiKey: 'AIzaSyDhQW1wLwQHa4we7k-gtmTdJQc8yFovTZk',
});

export interface Prediction {
  place_id: string;
  description: string;
}

export function useGoogleAutoComplete() {
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState<Prediction[]>([]);
  const autocompleteService = useRef<any>(null);

  useEffect(() => {
    (async function () {
      const maps = await loader.importLibrary('maps');
      autocompleteService.current = await loader.importLibrary('places');
    })();
  }, []);

  const selectPredictionLocation = useCallback((prediction: Prediction): Promise<Address> => {
    return new Promise((resolve, reject) => {
      const googlePlacesService = new autocompleteService.current.PlacesService(
        document.getElementById('dummy-google-component') as HTMLDivElement,
      );

      googlePlacesService.getDetails(
        {
          placeId: prediction.place_id,
        },
        (details: any, status: string) => {
          if (status !== 'OK') {
            return reject(new Error(status));
          }

          if (!details) {
            return reject(
              new Error(`Invalid location : ${prediction.place_id}  ${prediction.description}`),
            );
          }

          const components = GoogleApi.getAddressComponents(details.address_components);
          const location: Address = {
            text: prediction.description,
            lat: details.geometry.location.lat(),
            lng: details.geometry.location.lng(),
            placeId: prediction.place_id,
            ...components,
          };

          resolve(location);
        },
      );
    });
  }, []);

  const performSearch = async (text: string) => {
    try {
      new autocompleteService.current.AutocompleteService().getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: 'za' },
          types: ['address'],
        },
        (values: any, status: string) => {
          setIsLoading(false);
          if (status === 'ZERO_RESULTS') {
            return setList([]);
          }

          if (status !== 'OK') {
            return console.error({ status, text });
          }

          setList(values?.slice(0, 5));
        },
      );
    } catch (err) {
      console.log({ err });
    }
  };

  const debounce = (func: any) => {
    let timer: any;
    return function (...args: any) {
      // @ts-ignore
      const context = this;
      setIsLoading(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 1000);
    };
  };

  const debounceSearch = useCallback(debounce(performSearch), []);

  return {
    debounceSearch,
    list,
    setList,
    selectPredictionLocation,
    isLoading,
  };
}

export class GoogleApi {
  private baseURL = 'https://maps.googleapis.com/maps/api';
  private client = axios.create({
    baseURL: this.baseURL,
  });

  constructor(private readonly apiKey: string) {}

  static findByType(placeDetails: PlaceDetails[], type: string) {
    return placeDetails.find((place) => place.types.includes(type));
  }

  static findByTypes(placeDetails: PlaceDetails[], types: string[]) {
    for (const type of types) {
      const place = GoogleApi.findByType(placeDetails, type);

      if (place) {
        return place;
      }
    }
  }

  static getAddressComponents(details: PlaceDetails[]) {
    const postalCode = GoogleApi.findByType(details, 'postal_code');
    const country = GoogleApi.findByType(details, 'country');
    const state = GoogleApi.findByType(details, 'administrative_area_level_1');
    const city = GoogleApi.findByType(details, 'locality');

    const suburb = GoogleApi.findByTypes(details, [
      'sublocality_level_1',
      'sublocality',
      'locality',
    ]);

    return {
      suburb: suburb?.long_name ?? '',
      postalCode: postalCode?.long_name ?? '',
      province: state?.long_name ?? '',
      country: country?.long_name ?? '',
      city: city?.long_name ?? '',
    };
  }

  getElementInfo(row: Element) {
    return {
      distance: row.distance.value,
      duration: row.duration.value,
    };
  }
}

export type GetPropertyDistanceFromCampusResponse = Record<
  string,
  {
    distance: number;
    durationDriving: number;
    durationWalking: number;
  }
>;

export interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Row[];
  status: string;
}

interface PlaceDetails {
  long_name: string;
  short_name: string;
  types: string;
}

export interface Row {
  elements: Element[];
}

export interface Element {
  distance: Distance;
  duration: Distance;
  duration_in_traffic: Distance;
  status: string;
}

export interface Distance {
  text: string;
  value: number;
}

type Origin = {
  refId: string;
  lat: number;
  lng: number;
  placeId?: string;
};

export enum DistanceMode {
  driving = 'driving',
  walking = 'walking',
  bicycling = 'bicycling',
  transit = 'transit',
}
