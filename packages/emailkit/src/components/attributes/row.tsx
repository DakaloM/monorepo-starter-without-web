import * as React from 'react';

import * as styles from './index.css';

export interface AttributesRowProps {
  children?: React.ReactNode;
}

export function AttributesRow({ children }: AttributesRowProps): JSX.Element {
  return (
    <div className={styles.row} data-format="paragraph">
      {children}
    </div>
  );
}

AttributesRow.displayName = 'Attributes.Row';
