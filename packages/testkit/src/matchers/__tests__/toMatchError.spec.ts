class ExtendedError extends Error {
  public statusCode = 400;
  constructor(message: string) {
    super(message);
  }
}

describe('matchers/toMatchError', () => {
  test('correctly compares error classes', () => {
    expect(new Error('a')).toMatchError(Error);
  });

  test('fails on non matching classes', () => {
    expect(new ExtendedError('a')).toMatchError(Error, ['message', 'statusCode']);
  });

  test('correctly compares properties', () => {
    expect(new ExtendedError('a')).toMatchError(Error, ['message', 'statusCode']);
  });
});
