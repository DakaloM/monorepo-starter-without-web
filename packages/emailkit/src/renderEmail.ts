import { convert as convertText } from 'html-to-text';
import inlineCSS from 'juice';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Writable } from 'node:stream';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

let styles = '';

export async function renderEmail(
  children: React.ReactNode,
): Promise<{ html: string; text: string }> {
  if (!styles) {
    styles = await fs.readFile(path.join(__dirname, 'index.css'), 'utf-8');
  }

  return new Promise((resolve, _reject) => {
    let html = '';

    const writable = new Writable({
      write(chunk, _encoding, cb) {
        html += chunk;
        cb();
      },
      final() {
        html += '</body></html>';
        html = inlineCSS(html);

        const text = convertText(html, {
          wordwrap: false,
          selectors: [
            { selector: `[data-format="paragraph"]`, format: 'paragraph' },
            { selector: `[data-format="skip"]`, format: 'skip' },
            { selector: `[data-format="lineBreak"]`, format: 'lineBreak' },
          ],
        });

        resolve({ html, text });
      },
    });

    const { pipe } = ReactDOM.renderToPipeableStream(children, {
      onAllReady() {
        writable.write(wrapHtml({ styles }));
        pipe(writable);
      },
    });
  });
}

function wrapHtml(vars: { styles: string }): string {
  // TODO: Add dark-mode support
  // <meta name="color-scheme" content="light dark" />
  // <meta name="supported-color-schemes" content="light dark" />

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title></title>
      <style type="text/css" rel="stylesheet" media="all">
      ${vars.styles}
      </style>
    </head>
    <body>`;
}
