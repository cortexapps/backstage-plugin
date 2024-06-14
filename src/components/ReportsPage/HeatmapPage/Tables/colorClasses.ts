import { BackstageTheme } from '@backstage/theme';
import { makeStyles } from '@material-ui/core';

export const useColorCellStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    border: 'none',
    textAlign: 'center',
    minWidth: '100px',
  },
  success1: {
    background: '#00ca9b',
    color: theme.palette.common.black,
  },
  success2: {
    background: '#60e6c7',
    color: theme.palette.common.black,
  },
  success3: {
    background: '#b0ecde',
    color: theme.palette.common.black,
  },
  warning1: {
    background: '#ffecb3',
    color: theme.palette.common.black,
  },
  warning2: {
    background: '#ffca28',
    color: theme.palette.common.black,
  },
  warning3: {
    background: '#ffa001',
    color: theme.palette.common.black,
  },
  danger1: {
    background: '#ffd6dd',
    color: theme.palette.common.black,
  },
  danger2: {
    background: '#fe899e',
    color: theme.palette.common.black,
  },
  danger3: {
    background: '#fd496a',
    color: theme.palette.common.black,
  },
}));
