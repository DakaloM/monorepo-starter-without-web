import * as React from 'react';

import * as styles from './index.css';

export interface EmailBodyProps {
  children?: React.ReactNode;
}

export function EmailBody({ children }: EmailBodyProps): JSX.Element {
  return (
    <tr>
      <td className={styles.emailBody} width="570">
        <table
          className={styles.emailBodyInner}
          align="center"
          width="570"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
        >
          <tr>
            <td className={styles.content}>{children}</td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

EmailBody.displayName = 'Email.Body';
