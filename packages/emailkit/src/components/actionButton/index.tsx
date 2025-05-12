import * as React from 'react';

import * as styles from './index.css';

export interface ActionButtonIndexProps {
  children?: React.ReactNode;
  href: string;
}

export function ActionButton({ children, href }: ActionButtonIndexProps): JSX.Element {
  return (
    <table
      className="body-action"
      align="center"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
    >
      <tr>
        <td align="center">
          <table width="100%" border={0} cellSpacing="0" cellPadding="0" role="presentation">
            <tr>
              <td align="center">
                <p>
                  <a href={href} className={styles.emphasis['default']} target="_blank">
                    {children}
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
}
