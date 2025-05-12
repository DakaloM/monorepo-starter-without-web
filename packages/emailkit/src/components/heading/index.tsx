import * as React from 'react';

import * as styles from './index.css';

export interface HeadingProps {
  children?: React.ReactNode;
  level: 1 | 2 | 3;
}

export function Heading({ children, level }: HeadingProps): JSX.Element {
  return React.createElement(
    `h${level}`,
    {
      className: styles.variant[`level-${level}`],
    },
    children,
  );
}
