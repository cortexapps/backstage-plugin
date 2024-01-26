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
import {
  Button,
  FormControl,
  Grid,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { useAsync } from 'react-use';

import {
  Content,
  ContentHeader,
  EmptyState,
  ItemCardGrid,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { cortexApiRef } from '../../../api';
import { ScorecardCard } from '../ScorecardCard';

import { Scorecard, ServiceGroup } from '../../../api/types';
import {
  useDropdown,
  useInput,
  useScorecardCompareFn,
} from '../../../utils/hooks';
import { hasText } from '../../../utils/SearchUtils';
import SearchIcon from '@material-ui/icons/Search';
import { isEmpty, isNil, isUndefined } from 'lodash';
import { SortDropdown, SortMethods } from '../../Common/SortDropdown';

const defaultSortMethods: SortMethods<Scorecard> = {
  'Name ↑': (a: Scorecard, b: Scorecard) => a.name.localeCompare(b.name),
  'Name ↓': (a: Scorecard, b: Scorecard) => b.name.localeCompare(a.name),
};

export const hasTags = (groups: ServiceGroup[], query: string) => {
  return !isEmpty(groups)
    ? groups.some(tag => tag.tag.toLowerCase().includes(query.toLowerCase()))
    : false;
};

export const ScorecardList = () => {
  const cortexApi = useApi(cortexApiRef);
  const [searchQuery, setSearchQuery] = useInput();

  const {
    value: scorecards,
    loading: loadingScorecards,
    error: scorecardsError,
  } = useAsync(async () => {
    return await cortexApi.getScorecards();
  }, []);

  const {
    compareFn: scorecardCompareFn,
    loading: loadingScorecardCompareFn,
    error: scorecardCompareFnError,
  } = useScorecardCompareFn();

  const customScoresSortMethods: SortMethods<Scorecard> = useMemo(() => {
    if (isNil(scorecardCompareFn)) {
      return {} as SortMethods<Scorecard>;
    }

    return {
      'Custom ↑': (a: Scorecard, b: Scorecard) => scorecardCompareFn(a, b),
      'Custom ↓': (a: Scorecard, b: Scorecard) => -1 * scorecardCompareFn(a, b),
    };
  }, [scorecardCompareFn]);

  const scorecardScoresSortMethods: SortMethods<Scorecard> = useMemo(() => {
    return {
      ...customScoresSortMethods,
      ...defaultSortMethods,
    };
  }, [customScoresSortMethods]);

  const [sortBy, setSortBy] = useDropdown(
    isEmpty(customScoresSortMethods) ? 'Name ↑' : 'Custom ↑',
    [isEmpty(customScoresSortMethods)],
  );

  const scorecardsToDisplay = useMemo(() => {
    const scorecardsToDisplay = scorecards?.filter(scorecard => {
      if (isNil(searchQuery) || isEmpty(searchQuery)) {
        return true;
      }

      return (
        hasText(scorecard, 'name', searchQuery) ||
        hasText(scorecard, 'description', searchQuery) ||
        hasText(scorecard, 'filterQuery', searchQuery)
      );
    });

    if (sortBy) {
      scorecardsToDisplay?.sort(scorecardScoresSortMethods[sortBy]);
    }

    return scorecardsToDisplay;
  }, [scorecards, scorecardScoresSortMethods, searchQuery, sortBy]);

  if (
    loadingScorecards ||
    loadingScorecardCompareFn ||
    isUndefined(scorecardsToDisplay)
  ) {
    return <Progress />;
  }

  if (scorecardsError || scorecardCompareFnError) {
    return (
      <WarningPanel severity="error" title="Could not load Scorecards.">
        {scorecardsError?.message ?? scorecardCompareFnError?.message}
      </WarningPanel>
    );
  }

  if (!scorecards?.length) {
    return (
      <EmptyState
        missing="info"
        title="No scorecards to display"
        description="You haven't added any scorecards yet."
        action={
          <Button
            variant="contained"
            color="primary"
            href="https://backstage.io/docs/features/software-catalog/descriptor-format#kind-domain"
          >
            Read more
          </Button>
        }
      />
    );
  }

  return (
    <Content>
      <ContentHeader title="Scorecards" />
      <Grid container direction="column">
        <Grid
          container
          direction="row"
          lg={12}
          style={{ marginBottom: '20px' }}
        >
          <Grid item lg={10}>
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
          <Grid item lg={2}>
            <SortDropdown
              selected={sortBy}
              items={Object.keys(scorecardScoresSortMethods)}
              select={setSortBy}
            />
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {isEmpty(scorecardsToDisplay) && !isNil(searchQuery) && (
            <EmptyState
              title="No Scorecards matching search query"
              missing="data"
            />
          )}
          <ItemCardGrid>
            {scorecardsToDisplay.map(scorecard => (
              <ScorecardCard key={scorecard.id} scorecard={scorecard} />
            ))}
          </ItemCardGrid>
        </Grid>
      </Grid>
    </Content>
  );
};
