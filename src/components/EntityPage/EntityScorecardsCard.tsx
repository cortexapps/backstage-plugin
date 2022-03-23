/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { InfoCard } from '@backstage/core-components';
import {
  FormControl,
  InputAdornment,
  makeStyles,
  Table,
  TableBody,
  TextField,
} from '@material-ui/core';
import { EntityScorecardsCardRow } from './EntityScorecardsCardRow';
import { BackstageTheme } from '@backstage/theme';
import { ServiceScorecardScore } from '../../api/types';
import { SortDropdown } from '../Common/SortDropdown';
import { useDropdown, useInput } from '../../utils/hooks';
import SearchIcon from '@material-ui/icons/Search';
import { searchItems } from '../../utils/SearchUtils';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  table: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
    '&:nth-of-type(even)': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
  },
}));

export interface SortMethods<T> {
  [title: string]: (a: T, b: T) => number;
}

const scorecardScoresSortMethods: SortMethods<ServiceScorecardScore> = {
  'Name ↑': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
    a.scorecard.name.localeCompare(b.scorecard.name),
  'Name ↓': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
    b.scorecard.name.localeCompare(a.scorecard.name),
  'Score ↑': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
    a.score.scorePercentage > b.score.scorePercentage ? 1 : -1,
  'Score ↓': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
    b.score.scorePercentage > a.score.scorePercentage ? 1 : -1,
};

interface EntityScorecardsCardProps {
  title?: string;
  scores: ServiceScorecardScore[];
  selectedScorecardId?: number;
  onSelect: (scorecardId: number) => void;
}

export const EntityScorecardsCard = ({
  title,
  scores,
  selectedScorecardId,
  onSelect,
}: EntityScorecardsCardProps) => {
  const classes = useStyles();

  const [sortBy, setSortBy] = useDropdown('Name ↑');
  const [searchQuery, setSearchQuery] = useInput();

  const scoresToDisplay = useMemo(() => {
    const scoresToDisplay = searchItems(
      scores,
      ['scorecard.name', 'scorecard.description'],
      searchQuery,
    );

    if (sortBy) {
      scoresToDisplay.sort(scorecardScoresSortMethods[sortBy]);
    }

    return scoresToDisplay;
  }, [sortBy, searchQuery, scores]);

  return (
    <InfoCard
      title={title}
      action={
        <SortDropdown
          selected={sortBy}
          items={Object.keys(scorecardScoresSortMethods)}
          select={setSortBy}
        />
      }
      subheader={
        <FormControl fullWidth>
          <TextField
            variant="standard"
            label="Search"
            value={searchQuery}
            onChange={setSearchQuery}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      }
    >
      <Table className={classes.table}>
        <TableBody>
          {scoresToDisplay.map(score => (
            <EntityScorecardsCardRow
              key={`EntityScorecardsCardRow-${score.scorecard.id}`}
              score={score}
              onSelect={() => onSelect(score.scorecard.id)}
              selected={selectedScorecardId === score.scorecard.id}
            />
          ))}
        </TableBody>
      </Table>
    </InfoCard>
  );
};
