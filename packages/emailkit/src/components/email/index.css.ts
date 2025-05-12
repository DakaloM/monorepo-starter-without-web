import { globalStyle, style } from '@vanilla-extract/css';

globalStyle('html, body', {
  margin: 0,
  width: '100% !important',
  height: '100%',
  WebkitTextSizeAdjust: 'none',
});

globalStyle('body, td, th', {
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
});

globalStyle('td, th', {
  fontSize: '16px',
});

globalStyle('p, ul, ol, blockquote', {
  margin: '.4em 0 1.1875em',
  fontSize: '16px',
  lineHeight: '1.625',
});

export const preview = style([
  {
    display: 'none !important',
    visibility: 'hidden',
    fontSize: '1px',
    lineHeight: '1px',
    maxHeight: 0,
    maxWidth: 0,
    opacity: 0,
    overflow: 'hidden',
  },
]);

export const emailWrapper = style({
  width: '100%',
  margin: 0,
  padding: 0,
});

export const emailContent = style([emailWrapper]);

export const emailBody = style([emailWrapper]);

export const emailBodyInner = style({
  width: '570px',
  margin: '0 auto',
  padding: 0,
});

export const emailFooter = style([
  emailBodyInner,
  {
    color: '#A8AAAF',
    fontSize: '13px',
  },
]);

export const content = style({
  padding: '32px',
});

export const subtext = style({
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #EAEAEC',
});
