/*
 * Copyright 2023 Cortex Applications, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { GroupByOption } from '../../../../api/types';
import { Grid, Link, Typography, makeStyles } from '@material-ui/core';

interface Props {
  items: string[];
  onClick: (index?: number) => void;
  groupBy: GroupByOption;
  enableLastItem?: boolean;
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

const Breadcrumbs = ({ items, onClick, groupBy, enableLastItem }: Props) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.spacing}>
      <Grid container spacing={2} direction="row" alignItems="center">
        <Grid item>
          <Typography variant="subtitle2">
            Group By:{' '}
            <Link
              component={'button'}
              onClick={() => onClick()}
              color={'primary'}
              underline={'hover'}
            >
              {groupBy}
            </Link>
          </Typography>
        </Grid>
        {!!items.length && <BreadcrumbSeparator />}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const disabledItem = isLast && !enableLastItem;
          return (
            <>
              <Grid item>
                <Link
                  component={'button'}
                  key={index}
                  onClick={() => onClick(index)}
                  disabled={disabledItem}
                  color={disabledItem ? 'textPrimary' : 'primary'}
                  underline={disabledItem ? 'none' : 'hover'}
                  style={{ cursor: disabledItem ? 'default' : 'pointer' }}
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
