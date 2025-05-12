import * as React from 'react';

import * as styles from './index.css';

export interface AttributesMainProps {
  children?: React.ReactNode;
}

export function AttributesMain({ children }: AttributesMainProps): JSX.Element {
  return <div className={styles.main}>{children}</div>;
}

AttributesMain.displayName = 'Attributes.Main';
