import { styleVariants, style } from '@vanilla-extract/css';

const base = style({
  marginTop: 0,
  color: '#333333',
  fontWeight: 'bold',
  textAlign: 'left',
});

export const variant = styleVariants({
  'level-1': [base, { fontSize: '22px' }],
  'level-2': [base, { fontSize: '16px' }],
  'level-3': [base, { fontSize: '14px' }],
});
