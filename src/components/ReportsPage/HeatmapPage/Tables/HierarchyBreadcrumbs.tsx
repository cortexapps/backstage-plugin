import React from 'react';
import { GroupByOption } from '../../../../api/types';
import { Grid, Link, Typography, makeStyles } from '@material-ui/core';

interface Props {
  items: string[];
  onClick: (index: number) => void;
  groupBy: GroupByOption;
}

const BreadcrumbSeparator = () => {
  return (
    <Typography component={'span'} color="textSecondary">
      {' '}
      /{' '}
    </Typography>
  );
};

const useStyles = makeStyles(theme => ({
  spacing: {
    padding: theme.spacing(2, 0),
  },
}));

const Breadcrumbs = ({ items, onClick, groupBy }: Props) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.spacing}>
      <Grid container spacing={2} direction="row" alignItems="center">
        <Grid item>
          <Typography variant="subtitle2">Group By: {groupBy}</Typography>
        </Grid>
        {!!items.length && <BreadcrumbSeparator />}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <>
              <Grid item>
                <Link
                  component={'button'}
                  key={index}
                  onClick={() => onClick(index)}
                  disabled={isLast}
                  color={isLast ? 'textPrimary' : 'primary'}
                  underline={isLast ? 'none' : 'hover'}
                  style={{ cursor: isLast ? 'default' : 'pointer' }}
                >
                  {item}
                </Link>
              </Grid>
              {!isLast && <BreadcrumbSeparator />}
            </>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default Breadcrumbs;
