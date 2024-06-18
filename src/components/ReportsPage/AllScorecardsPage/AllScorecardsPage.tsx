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
import React, { useCallback, useState } from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { AllScorecardsHeatmap } from './AllScorecardsHeatmap';
import { GroupByOption } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';
import { stringifyUrl } from 'query-string';

export const AllScorecardsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [groupBy, setGroupBy] = useState<GroupByOption>(
    (searchParams.get('groupBy') as GroupByOption) ?? GroupByOption.ENTITY,
  );
  const setGroupByAndNavigate = useCallback((groupBy: GroupByOption) => {
    setGroupBy(groupBy);

    const targetUrl = stringifyUrl({ url: location.pathname, query: {
      groupBy: groupBy !== GroupByOption.ENTITY ? groupBy as string : undefined,
    } });

    navigate(targetUrl, { replace: true });
  }, [location.pathname, navigate]);

  const getShareableLink = useCallback(
    () => buildUrl({ groupBy }, location.pathname)
  , [location, groupBy]);

  return (
    <Content>
      <ContentHeader title="All Scorecards">
        <CopyButton textToCopy={getShareableLink} aria-label="Share link">
          Share link
        </CopyButton>
      </ContentHeader>
      <Grid container direction="column">
        <Grid item>
          <GroupByDropdown groupBy={groupBy} setGroupBy={setGroupByAndNavigate} />
        </Grid>
        <Grid item lg={12}>
          <AllScorecardsHeatmap groupBy={groupBy} />
        </Grid>
      </Grid>
    </Content>
  );
};
