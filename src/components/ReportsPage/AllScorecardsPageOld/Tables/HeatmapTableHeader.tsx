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
import { IconButton, makeStyles, TableCell } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';
import { SortBy } from '../HeatmapFilters';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';

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

const Sorter = ({
  sortBy,
  sortKey,
  setSortBy,
}: {
  sortBy?: SortBy;
  sortKey: SortBy['column'];
  setSortBy: Dispatch<React.SetStateAction<SortBy | undefined>>;
}) => {
  const isSelected = sortBy?.column === sortKey;
  const isDescending = isSelected && sortBy?.desc;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <IconButton
        onClick={() => {
          setSortBy({
            column: sortKey,
            desc: true,
          });
        }}
      >
        <ArrowDropUp
          color={!isDescending && isSelected ? 'primary' : 'action'}
        />
      </IconButton>
      <IconButton
        onClick={() => {
          setSortBy({
            column: sortKey,
            desc: false,
          });
        }}
      >
        <ArrowDropDown
          color={isDescending && isSelected ? 'primary' : 'action'}
        />
      </IconButton>
    </div>
  );
};

const MIN_COL_WIDTH = '150px';
const firstColumn = { width: `15%`, minWidth: MIN_COL_WIDTH };
const secondaryColumns = { width: `10%`, minWidth: MIN_COL_WIDTH };

export const HeatmapTableHeader = ({
  headers,
  sortBy,
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
              ? firstColumn
              : [1, 2].includes(idx)
              ? secondaryColumns
              : { width: `${cellWidth}%`, minWidth: MIN_COL_WIDTH };

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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span>{label}</span>
                {sortKey && setSortBy && (
                  <Sorter
                    sortBy={sortBy}
                    sortKey={sortKey}
                    setSortBy={setSortBy}
                  />
                )}
              </div>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
