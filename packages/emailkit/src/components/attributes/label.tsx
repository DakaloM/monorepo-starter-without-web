import * as React from 'react';

import * as styles from './index.css';

export interface AttributesLabelProps {
  children?: React.ReactNode;
}

export function AttributesLabel({ children }: AttributesLabelProps): JSX.Element {
  return (
    <div className={styles.label}>
      {children}
      <div data-format="lineBreak" />
    </div>
  );
}

AttributesLabel.displayName = 'Attributes.Label';
