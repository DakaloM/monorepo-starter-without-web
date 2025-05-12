import { BaseModel } from '@num/datakit';

export class Address extends BaseModel {
  static tableName = 'address';

  id: string;
  refId: string;
  text: string;
  postalCode: string;
  suburb: string;
  city: string;
  province: string;
  country: string;
  placeId: string | null;
  lat: number;
  lng: number;
}
