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
import React, { useCallback } from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { AllScorecardsHeatmap } from './AllScorecardsHeatmap';
import { useDropdown } from '../../../utils/hooks';
import { GroupByOption } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation } from 'react-router-dom';
import { buildUrl } from '../../../utils/URLUtils';

export const AllScorecardsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(useLocation().search);

  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    (queryParams.get('groupBy') as GroupByOption) ?? GroupByOption.SERVICE,
  );

  const getShareableLink = useCallback(() => {
    const queryParamsObj = {
      groupBy,
    };
    return buildUrl(queryParamsObj, location.pathname);
  }, [location, groupBy]);

  return (
    <Content>
      <ContentHeader title="All Scorecards">
        <CopyButton label="Share link" textToCopy={getShareableLink} />
      </ContentHeader>
      <Grid container direction="column">
        <Grid item>
          <GroupByDropdown groupBy={groupBy} setGroupBy={setGroupBy} />
        </Grid>
        <Grid item lg={12}>
          <AllScorecardsHeatmap groupBy={groupBy!!} />
        </Grid>
      </Grid>
    </Content>
  );
};
