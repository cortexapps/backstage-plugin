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
import { cortexApiRef } from '../../../api';
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
import { InitiativeCard } from '../InitiativeCard';
import {
  FormControl,
  Grid,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { isEmpty, isNil } from 'lodash';
import { useInput } from '../../../utils/hooks';
import { hasText } from '../../../utils/SearchUtils';
import { Initiative } from '../../../api/types';
import { hasTags } from '../../Scorecards/ScorecardsPage/ScorecardList';

export const InitiativesList = () => {
  const cortexApi = useApi(cortexApiRef);
  const [searchQuery, setSearchQuery] = useInput();

  const {
    value: initiatives = [],
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getInitiatives();
  }, []);

  const initiativesToDisplay = useMemo(() => {
    const initiativesToDisplay = initiatives.filter(initiative => {
      if (isNil(searchQuery) || isEmpty(searchQuery)) {
        return true;
      }

      return (
        hasText(initiative, 'name', searchQuery) ||
        hasText(initiative, 'description', searchQuery) ||
        hasText(initiative, 'scorecard.name', searchQuery) ||
        hasText(initiative, 'scorecard.description', searchQuery) ||
        hasTags(initiative.tags, searchQuery)
      );
    });

    return initiativesToDisplay?.sort((a: Initiative, b: Initiative) =>
      a.name.localeCompare(b.name),
    );
  }, [initiatives, searchQuery]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not load Initiatives.">
        {error.message}
      </WarningPanel>
    );
  }

  if (!initiatives?.length) {
    return (
      <EmptyState
        missing="info"
        title="No initiatives to display"
        description="You haven't added any initiatives yet."
      />
    );
  }

  return (
    <Content>
      <ContentHeader title="Initiatives" />
      <Grid container direction="column">
        <Grid item lg={12} style={{ marginBottom: '20px' }}>
          <FormControl fullWidth>
            <TextField
              variant="standard"
              placeholder="Search"
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
        <Grid item lg={12}>
          {isEmpty(initiativesToDisplay) && !isNil(searchQuery) && (
            <EmptyState
              title="No Initiatives matching search query"
              missing="data"
            />
          )}
          <ItemCardGrid>
            {initiativesToDisplay.map(initiative => (
              <InitiativeCard
                key={`InitiativeCard-${initiative.id}`}
                initiative={initiative}
              />
            ))}
          </ItemCardGrid>
        </Grid>
      </Grid>
    </Content>
  );
};
