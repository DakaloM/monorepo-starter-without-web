import { fail, pass } from './utils';

function idObjectToString(idObject: IdObject) {
  if (typeof idObject === 'string') {
    return idObject;
  }
  return idObject.id;
}
export function toIncludeIds(
  received: IdObject[],
  expected: IdObject[],
  props: string[] = ['message'],
): any {
  const receivedIds = received.map(idObjectToString);
  const expectedIds = expected.map(idObjectToString);
  const receivedSet = new Set(receivedIds);
  const isValid = expectedIds.every((id) => receivedSet.has(id));

  if (isValid) {
    return pass();
  }

  return fail(() => `Expected ids "${expectedIds}" do not match received ids "${receivedIds}"`);
}

export type IdObject = string | { id: string };
