export enum AuthorizerType {
  Client = 'CLIENT',
  Identity = 'IDENTITY',
}

export interface ServerEndpointHandler<T = unknown, R = unknown> {
  authType: AuthorizerType;
  handler: (event: T) => Promise<R>;
}
