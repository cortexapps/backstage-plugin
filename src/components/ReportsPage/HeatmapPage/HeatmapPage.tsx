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
import React, { useState } from 'react';
import { Content, ContentHeader } from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { AllScorecardsHeatmap } from './AllScorecardsHeatmap';
import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useDropdown } from '../../../utils/hooks';
import { GroupByOption } from '../../../api/types';
import { GroupByDropdown } from '../Common/GroupByDropdown';

export const HeatmapPage = () => {
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    number | undefined
  >();
  const [groupBy, setGroupBy] = useDropdown<GroupByOption>(
    GroupByOption.SCORECARD,
  );

  return (
    <Content>
      <ContentHeader title="Bird's Eye" />
      <Grid container direction="column">
        <Grid item lg={12}>
          <ScorecardSelector
            onSelect={setSelectedScorecardId}
            selectedScorecardId={selectedScorecardId}
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
