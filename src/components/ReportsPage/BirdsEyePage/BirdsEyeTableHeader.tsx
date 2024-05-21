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
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { makeStyles, TableCell } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';

const useBirdsEyeTableHeaderStyles = makeStyles<BackstageTheme>({
  root: {
    textAlign: 'center',
  },
});

interface BirdsEyeTableHeaderProps {
  headers: string[];
}

export const BirdsEyeTableHeader = ({ headers }: BirdsEyeTableHeaderProps) => {
  const classes = useBirdsEyeTableHeaderStyles();

  const cellWidth = 85 / headers.length;

  return (
    <TableHead>
      <TableRow>
        {headers.map((headerText, idx) => {
          // first column set to 10% so that names don't get squished
          const style =
            idx === 0 ? { width: `15%` } : { width: `${cellWidth}%` };

          return (
            <TableCell
              key={`BirdsEyeTableHeader-${idx}`}
              className={classes.root}
              style={style}
            >
              {headerText}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
