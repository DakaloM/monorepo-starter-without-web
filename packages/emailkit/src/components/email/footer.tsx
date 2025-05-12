import * as React from 'react';

import * as styles from './index.css';

export interface EmailFooterProps {
  children?: React.ReactNode;
}

export function EmailFooter({ children }: EmailFooterProps): JSX.Element {
  return (
    <tr>
      <td>
        <table
          className={styles.emailFooter}
          align="center"
          width="570"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
        >
          <tr>
            <td className={styles.content} align="center">
              {children}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

EmailFooter.displayName = 'Email.Footer';
