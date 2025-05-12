import * as React from 'react';

export interface EmailRootProps {
  children?: React.ReactNode;
}

export function EmailRoot({ children }: EmailRootProps): JSX.Element {
  return <>{children}</>;
}

EmailRoot.displayName = 'Email.Root';
