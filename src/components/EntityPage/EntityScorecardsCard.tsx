/*
 * Copyright 2024 Cortex Applications, Inc.
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
import { InfoCard, Progress, WarningPanel } from '@backstage/core-components';
import {
  FormControl,
  Grid,
  InputAdornment,
  makeStyles,
  Table,
  TableBody,
  TextField,
  Typography,
} from '@material-ui/core';
import { EntityScorecardsCardRow } from './EntityScorecardsCardRow';
import { BackstageTheme } from '@backstage/theme';
import { ServiceScorecardScore } from '../../api/types';
import { SortDropdown, SortMethods } from '../Common/SortDropdown';
import {
  useDropdown,
  useInput,
  usePartialScorecardCompareFn,
} from '../../utils/hooks';
import SearchIcon from '@material-ui/icons/Search';
import { searchItems } from '../../utils/SearchUtils';
import { isEmpty, isNil } from 'lodash';

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

const defaultSortMethods: SortMethods<ServiceScorecardScore> = {
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

  const [searchQuery, setSearchQuery] = useInput();

  const {
    compareFn: scorecardCompareFn,
    loading: loadingScorecardCompareFn,
    error: scorecardCompareFnError,
  } = usePartialScorecardCompareFn();

  const customScoresSortMethods: SortMethods<ServiceScorecardScore> =
    useMemo(() => {
      if (isNil(scorecardCompareFn)) {
        return {} as SortMethods<ServiceScorecardScore>;
      }

      return {
        'Custom ↑': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
          scorecardCompareFn(a.scorecard, b.scorecard),
        'Custom ↓': (a: ServiceScorecardScore, b: ServiceScorecardScore) =>
          -1 * scorecardCompareFn(a.scorecard, b.scorecard),
      };
    }, [scorecardCompareFn]);

  const scorecardScoresSortMethods: SortMethods<ServiceScorecardScore> =
    useMemo(() => {
      return {
        ...customScoresSortMethods,
        ...defaultSortMethods,
      };
    }, [customScoresSortMethods]);

  const [sortBy, setSortBy] = useDropdown(
    isEmpty(customScoresSortMethods) ? 'Name ↑' : 'Custom ↑',
    [isEmpty(customScoresSortMethods)],
  );

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
  }, [scores, searchQuery, sortBy, scorecardScoresSortMethods]);

  if (loadingScorecardCompareFn) {
    return <Progress />;
  }

  if (scorecardCompareFnError) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecards.">
        {scorecardCompareFnError.message}
      </WarningPanel>
    );
  }

  return (
    <InfoCard title={title}>
      <Grid container direction="column">
        <Grid
          container
          direction="row"
          lg={12}
          style={{ marginBottom: '20px' }}
        >
          <Grid item lg={9}>
            <FormControl fullWidth>
              <TextField
                variant="standard"
                placeholder="Search by name, description, or filters"
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
          </Grid>
          <Grid item lg={3}>
            <SortDropdown
              selected={sortBy}
              items={Object.keys(scorecardScoresSortMethods)}
              select={setSortBy}
            />
          </Grid>
        </Grid>
        <Table className={classes.table}>
          <TableBody>
            {isEmpty(scoresToDisplay) && !isNil(searchQuery) && (
              <Typography variant="subtitle1">
                No Scorecards matching search query
              </Typography>
            )}
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
      </Grid>
    </InfoCard>
  );
};
