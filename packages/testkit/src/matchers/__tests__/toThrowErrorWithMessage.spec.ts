class CustomExtendedError extends Error {
  public statusCode = 400;
  constructor(message: string) {
    super(message);
  }
}

describe('test/matchers/toThrowErrorWithMessage', () => {
  test('correctly compares errors', () => {
    expect(() => {
      throw new Error('a');
    }).toThrowErrorWithMessage(Error, 'a');
  });

  test('fails on non matching errors', () => {
    try {
      expect(() => {
        throw new Error('a');
      }).toThrowErrorWithMessage(ExtendedError, 'something else');
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).toMatchSnapshot(
          `Expected an error of type "BadRequestError" with message:`,
        );
      } else {
        throw err;
      }
    }
  });
});
