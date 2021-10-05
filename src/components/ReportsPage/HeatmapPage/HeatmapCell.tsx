/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { makeStyles, TableCell, Typography } from '@material-ui/core';
import { percentify } from '../../../utils/numeric';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    border: 'none',
    textAlign: 'center',
    color: theme.palette.common.black,
    minWidth: '100px',
  },
  success1: {
    background: '#00ca9b',
  },
  success2: {
    background: '#60e6c7',
  },
  success3: {
    background: '#b0ecde',
  },
  warning1: {
    background: '#ffecb3',
  },
  warning2: {
    background: '#ffca28',
  },
  warning3: {
    background: '#ffa001',
  },
  danger1: {
    background: '#ffd6dd',
  },
  danger2: {
    background: '#fe899e',
  },
  danger3: {
    background: '#fd496a',
  },
}));

function getCellClassname(value?: number): string | undefined {
  if (value === undefined) return undefined;

  if (value > 0.9) {
    return 'success1';
  } else if (value > 0.8) {
    return 'success2';
  } else if (value > 0.7) {
    return 'success3';
  } else if (value > 0.6) {
    return 'warning1';
  } else if (value > 0.5) {
    return 'warning2';
  } else if (value > 0.4) {
    return 'warning3';
  } else if (value > 0.3) {
    return 'danger1';
  } else if (value > 0.2) {
    return 'danger2';
  }

  return 'danger3';
}

interface HeatmapCellProps {
  score?: number;
  text?: string;
}

export const HeatmapCell = ({ score, text }: HeatmapCellProps) => {
  const classes = useStyles();
  const clazz = getCellClassname(score);

  return (
    <TableCell className={`${classes.root} ${clazz ? classes[clazz] : ''}`}>
      <Typography variant="h6" style={{ display: 'inline-block' }}>
        {text ?? (score !== undefined ? `${percentify(score)}%` : '')}
      </Typography>
    </TableCell>
  );
};
