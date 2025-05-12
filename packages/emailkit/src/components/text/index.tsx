import * as React from 'react';

export interface TextProps {
  children?: React.ReactNode;
  newlines?: boolean;
}

export function Text({ children, newlines = false }: TextProps): JSX.Element | null {
  if (newlines) {
    if (typeof children !== 'string') {
      return null;
    }

    return (
      <>
        {children.split('\n').map((part, idx) => {
          return (
            <React.Fragment key={idx}>
              {part}
              <br />
            </React.Fragment>
          );
        })}
      </>
    );
  }

  return <>{children}</>;
}
