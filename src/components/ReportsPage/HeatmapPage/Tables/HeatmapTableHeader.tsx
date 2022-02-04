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
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { TableCell } from '@material-ui/core';
import { useHeatmapStyles } from '../AllScorecardsHeatmap';

interface HeatmapTableHeaderProps {
  headers: string[];
}

export const HeatmapTableHeader = ({ headers }: HeatmapTableHeaderProps) => {
  const classes = useHeatmapStyles();

  const cellWidth = 100 / headers.length;
  const style = { width: `${cellWidth}%` };

  return (
    <TableHead>
      <TableRow>
        {headers.map((headerText, idx) => (
          <TableCell
            key={`HeatmapTableHeader-${idx}`}
            className={classes.root}
            style={style}
          >
            {headerText}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
