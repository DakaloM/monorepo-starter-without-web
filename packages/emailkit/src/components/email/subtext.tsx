import * as React from 'react';

import * as styles from './index.css';

export interface EmailSubtextProps {
  children?: React.ReactNode;
}

export function EmailSubtext({ children }: EmailSubtextProps): JSX.Element {
  return (
    <table className={styles.subtext} role="presentation" data-format="skip">
      <tr>
        <td>{children}</td>
      </tr>
    </table>
  );
}

EmailSubtext.displayName = 'Email.Subtext';
