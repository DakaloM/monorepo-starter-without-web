import * as React from 'react';

import * as styles from './index.css';

export interface EmailLayoutProps {
  children?: React.ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps): JSX.Element {
  return (
    <table
      className={styles.emailWrapper}
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
    >
      <tr>
        <td align="center">
          <table
            className={styles.emailContent}
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
          >
            {children}
          </table>
        </td>
      </tr>
    </table>
  );
}

EmailLayout.displayName = 'Email.Layout';
