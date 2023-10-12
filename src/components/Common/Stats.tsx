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
import { alpha, makeStyles } from '@material-ui/core';
import classnames from 'classnames';
import { identity } from 'lodash';
import React, { PropsWithChildren } from 'react';
import { fallbackPalette } from '../../styles/styles';

interface StatsProps extends PropsWithChildren {
  column?: boolean;
  stretch?: boolean;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '& li': {
      flex: 1,
      maxWidth: 300,
      '&:last-child': {
        borderRight: 'none',
      },
    },
  },
  flexRow: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  rowItem: {
    borderRight: `1px solid ${alpha(fallbackPalette.common.white, 0.12)}`,
    padding: 20,
  },
  columnItem: {
    padding: 20,
  },
});

const Stats: React.FC<StatsProps> = ({ children, column = false, stretch }) => {
  const classes = useStyles();
  // filter falsey (e.g. null) children out
  const childrenToRender = React.Children.toArray(children).filter(identity);

  return (
    <ol
      className={classnames(classes.root, {
        [classes.flex1]: stretch,
        [classes.flexRow]: !column,
      })}
    >
      {React.Children.map(childrenToRender, (child, idx) => {
        return (
          <li
            key={`stats-item-${idx}`}
            className={classnames({
              [classes.rowItem]: !column,
              [classes.columnItem]: column,
            })}
          >
            {child}
          </li>
        );
      })}
    </ol>
  );
};

export default Stats;
