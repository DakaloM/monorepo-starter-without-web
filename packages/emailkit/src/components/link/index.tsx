import * as React from 'react';

import * as styles from './index.css';

export interface LinkProps {
  children?: React.ReactNode;
  href: string;
}

export function Link({ children, href }: LinkProps): JSX.Element {
  return (
    <a href={href} className={styles.link}>
      {children}
    </a>
  );
}
