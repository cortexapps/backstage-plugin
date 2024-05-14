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
import { capitalize, isEmpty, isNil, isUndefined } from 'lodash';
import { useDropdown, useInitiativesCustomName, useInput } from '../../../utils/hooks';
import { hasText } from '../../../utils/SearchUtils';
import { Initiative } from '../../../api/types';
import { SortDropdown, SortMethods } from '../../Common/SortDropdown';
import moment from 'moment';

const defaultSortMethods: SortMethods<Initiative> = {
  'Name ↑': (a: Initiative, b: Initiative) => a.name.localeCompare(b.name),
  'Name ↓': (a: Initiative, b: Initiative) => b.name.localeCompare(a.name),
  'Due date ↑': (a: Initiative, b: Initiative) =>
    moment(a.targetDate).diff(b.targetDate),
  'Due date ↓': (a: Initiative, b: Initiative) =>
    moment(b.targetDate).diff(a.targetDate),
};

export const InitiativesList = () => {
  const cortexApi = useApi(cortexApiRef);
  const [searchQuery, setSearchQuery] = useInput();

  const {
    value: initiatives,
    loading,
    error,
  } = useAsync(async () => {
    return await cortexApi.getInitiatives();
  }, []);

  const [sortBy, setSortBy] = useDropdown('Name ↑');

  const initiativesToDisplay = useMemo(() => {
    const initiativesToDisplay = initiatives?.filter(initiative => {
      if (isNil(searchQuery) || isEmpty(searchQuery)) {
        return true;
      }

      return (
        hasText(initiative, 'name', searchQuery) ||
        hasText(initiative, 'description', searchQuery) ||
        hasText(initiative, 'scorecard.name', searchQuery) ||
        hasText(initiative, 'scorecard.description', searchQuery)
      );
    });

    if (sortBy) {
      initiativesToDisplay?.sort(defaultSortMethods[sortBy]);
    }

    return initiativesToDisplay;
  }, [initiatives, searchQuery, sortBy]);
  
  const { plural: initiativesName } = useInitiativesCustomName();

  if (loading || isUndefined(initiativesToDisplay)) {
    return <Progress />;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title={`Could not load ${capitalize(initiativesName)}.`}>
        {error.message}
      </WarningPanel>
    );
  }

  if (!initiatives?.length) {
    return (
      <EmptyState
        missing="info"
        title={`No ${initiativesName} to display`}
        description={`You haven't added any ${initiativesName} yet.`}
      />
    );
  }

  return (
    <Content>
      <ContentHeader title={capitalize(initiativesName)} />
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
              items={Object.keys(defaultSortMethods)}
              select={setSortBy}
            />
          </Grid>
        </Grid>
        <Grid item lg={12}>
          {isEmpty(initiativesToDisplay) && !isNil(searchQuery) && (
            <EmptyState
              title={`No ${capitalize(initiativesName)} matching search query`}
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
