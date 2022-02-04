/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useDropdown } from '../../../utils/hooks';
import { GroupByOption } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';
import { CopyButton } from '../../Common/CopyButton';
import { useLocation } from 'react-router';
import { buildUrl } from '../../../utils/URLUtils';

export const HeatmapPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(useLocation().search);

  const queryScorecardId = Number(queryParams.get('scorecardId') ?? undefined);
  const initialScorecardId = Number.isNaN(queryScorecardId)
    ? undefined
    : queryScorecardId;

  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
  >(initialScorecardId);

  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    (queryParams.get('groupBy') as GroupByOption) ?? GroupByOption.SCORECARD,
  );

  const getShareableLink = useCallback(() => {
    const queryParamsObj = {
      scorecardId: selectedScorecardId,
      groupBy,
    };
    return buildUrl(queryParamsObj, location.pathname);
  }, [location, selectedScorecardId, groupBy]);

  return (
    <Content>
      <ContentHeader title="Bird's Eye">
        <CopyButton label="Share link" textToCopy={getShareableLink} />
      </ContentHeader>
      <Grid container direction="column">
        <Grid item lg={12}>
          <ScorecardSelector
            selectedScorecardId={selectedScorecardId}
            onSelect={setSelectedScorecardId}
          />
        </Grid>
        <Grid item style={{ marginTop: '20px' }}>
          <GroupByDropdown groupBy={groupBy} setGroupBy={setGroupBy} />
        </Grid>
        <Grid item lg={12}>
          {selectedScorecardId === undefined ? (
            <AllScorecardsHeatmap groupBy={groupBy!!} />
          ) : (
            <SingleScorecardHeatmap
              scorecardId={selectedScorecardId}
              groupBy={groupBy!!}
            />
          )}
        </Grid>
      </Grid>
    </Content>
  );
};
