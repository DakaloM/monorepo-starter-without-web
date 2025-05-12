import { TypeIdentifier } from './type';

export const types = Object.values(TypeIdentifier).map((identifier) => ({
  identifier,
}));
