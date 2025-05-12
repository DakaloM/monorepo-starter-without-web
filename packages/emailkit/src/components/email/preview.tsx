import * as React from 'react';

import * as styles from './index.css';

export interface EmailPreviewProps {
  children?: React.ReactNode;
}

export function EmailPreview({ children }: EmailPreviewProps): JSX.Element {
  return <span className={styles.preview}>{children}</span>;
}

EmailPreview.displayName = 'Email.Preview';
