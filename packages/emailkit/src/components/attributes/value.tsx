import * as React from 'react';

export interface AttributesValueProps {
  children?: React.ReactNode;
}

export function AttributesValue({ children }: AttributesValueProps): JSX.Element {
  return <div>{children}</div>;
}

AttributesValue.displayName = 'Attributes.Value';
