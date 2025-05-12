import { styleVariants, style } from '@vanilla-extract/css';

const base = style({
  backgroundColor: '#3869D4',
  borderTop: '10px solid #3869D4',
  borderRight: '18px solid #3869D4',
  borderBottom: '10px solid #3869D4',
  borderLeft: '18px solid #3869D4',
  display: 'inline-block',
  color: '#FFF',
  textDecoration: 'none',
  borderRadius: '3px',
  boxShadow: '0 2px 3px rgba(0, 0, 0, 0.16)',
  WebkitTextSizeAdjust: 'none',
  boxSizing: 'border-box',
});

export const emphasis = styleVariants({
  default: [base],
  primary: [
    base,
    {
      backgroundColor: '#22BC66',
      borderTop: '10px solid #22BC66',
      borderRight: '18px solid #22BC66',
      borderBottom: '10px solid #22BC66',
      borderLeft: '18px solid #22BC66',
    },
  ],
});
