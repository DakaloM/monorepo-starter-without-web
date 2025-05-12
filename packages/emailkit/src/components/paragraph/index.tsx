import * as React from 'react';

export interface ParagraphProps {
  children?: React.ReactNode;
}

export function Paragraph({ children }: ParagraphProps): JSX.Element {
  return <p>{children}</p>;
}
