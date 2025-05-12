import { builder } from '~/graphql/builder';

import { allow } from 'graphql-shield';

import { Address } from '../address';

export const AddressSchema = builder.objectType(Address, {
  name: 'Address',
  description: 'An address',
  interfaces: [],
  shield: allow,
  fields: (t) => ({
    text: t.exposeString('text'),
    suburb: t.exposeString('suburb'),
    city: t.exposeString('city'),
    province: t.exposeString('province'),
    postalCode: t.exposeString('postalCode'),
    country: t.exposeString('country'),
    placeId: t.exposeString('placeId', { nullable: true }),
    lat: t.exposeFloat('lat'),
    lng: t.exposeFloat('lng'),
  }),
});

export const AddressInputSchema = builder.inputType('AddressInput', {
  fields: (t) => ({
    text: t.string({ required: true }),
    suburb: t.string({ required: true }),
    city: t.string({ required: true }),
    province: t.string({ required: true }),
    postalCode: t.string({ required: true }),
    country: t.string({ required: true }),
    placeId: t.string({ required: true }),
    lat: t.float({ required: true }),
    lng: t.float({ required: true }),
  }),
});
