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
import { TableCell, Typography } from '@material-ui/core';
import { percentify } from '../../../utils/NumberUtils';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

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
  colorClasses: ClassNameMap<string>;
}

export const HeatmapCell = ({
  score,
  text,
  colorClasses,
}: HeatmapCellProps) => {
  const className = getCellClassname(score);

  return (
    <TableCell
      className={`${colorClasses.root} ${
        className ? colorClasses[className] : ''
      }`}
    >
      <Typography variant="h6" style={{ display: 'inline-block' }}>
        {text ?? (score !== undefined ? `${percentify(score)}%` : '')}
      </Typography>
    </TableCell>
  );
};
