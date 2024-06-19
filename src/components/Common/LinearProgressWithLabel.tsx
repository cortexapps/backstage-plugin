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
import React, { useMemo } from 'react';
import { LinearProgress, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { isNil } from 'lodash';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface LinearProgressWithLabelProps {
  classes: ClassNameMap<string>;
  value: number;
  colorByValue?: boolean;
  label?: string;
}

export function colorForNum(value: number): 'success' | 'warning' | 'danger' {
  if (value > 90) {
    return 'success';
  } else if (value > 49) {
    return 'warning';
  } else {
    return 'danger';
  }
}

export const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> =
  ({ value, classes, colorByValue, label }) => {
    const className = useMemo(() => {
      const color = colorByValue ? undefined : colorForNum(value);

      return isNil(color)
        ? undefined
        : color === 'success'
        ? classes.barColorSuccess
        : color === 'warning'
        ? classes.barColorWarning
        : classes.barColorDanger;
    }, [classes, colorByValue, value]);

    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress
            variant="determinate"
            value={value}
            classes={{ barColorPrimary: className }}
          />
        </Box>
        <Box minWidth={45}>
          <Typography variant="body1">
            {label ?? `${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };
