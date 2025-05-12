import { Kind } from 'graphql';
import { z } from 'zod';

import { builder } from './builder';

const EmailSchema = z
  .string()
  .email()
  .transform((value) => value.toLowerCase());

const parseEmail = (value: unknown) => {
  const parsed = EmailSchema.safeParse(value);

  if (parsed.success) {
    return parsed.data;
  }

  throw Error('GraphQL EmailAddress Scalar serializer expected a `string`');
};

export const DateScalar = builder.scalarType('Date', {
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number' || typeof value === 'string') {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `number` or `string`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    // Invalid hard-coded value (not an integer)
    throw new Error('GraphQL Date Scalar can only be a string or number');
  },
});

export const EmailScalar = builder.scalarType('EmailAddress', {
  serialize: parseEmail,
  parseValue: parseEmail,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseEmail(ast.value);
    }
    throw new Error('GraphQL EmailAddress Scalar can only be a string');
  },
});

export const JSONScalar = builder.scalarType('JSON', {
  serialize(value) {
    return JSON.stringify(value);
  },
  parseValue(value) {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    throw new Error('GraphQL JSON Scalar serializer expected a `string` object');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    throw new Error('GraphQL JSON Scalar serializer expected a `string` object');
  },
});
