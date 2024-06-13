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
import React, { Dispatch } from 'react';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableRow from '@material-ui/core/TableRow/TableRow';
import { makeStyles, TableCell } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';
import { SortBy } from '../HeatmapFilters';

const useHeatmapStyles = makeStyles<BackstageTheme>({
  root: {
    textAlign: 'center',
  },
});

export interface HeaderItem {
  sortKey?: SortBy['column'];
  label: string;
}

interface HeatmapTableHeaderProps {
  headers: HeaderItem[];
  sortBy?: SortBy;
  setSortBy?: Dispatch<React.SetStateAction<SortBy | undefined>>;
}

export const HeatmapTableHeader = ({
  headers,
  // sortBy,
  setSortBy,
}: HeatmapTableHeaderProps) => {
  const classes = useHeatmapStyles();

  const cellWidth = 85 / headers.length;

  return (
    <TableHead>
      <TableRow>
        {headers.map(({ sortKey, label }, idx) => {
          // first column set to 10% so that names don't get squished
          const style =
            idx === 0
              ? { width: `15%`, minWidth: '108px' }
              : { width: `${cellWidth}%` };

          return (
            <TableCell
              key={`HeatmapTableHeader-${idx}`}
              className={classes.root}
              style={style}
              onClick={() => {
                if (sortKey && setSortBy) {
                  setSortBy(prev => {
                    if (prev?.column === sortKey) {
                      return { column: sortKey, desc: !prev.desc };
                    }
                    return { column: sortKey, desc: false };
                  });
                }
              }}
            >
              {label}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
