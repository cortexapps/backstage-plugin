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
import React, { useMemo } from 'react';
import { isUndefined } from 'lodash';
import { WarningPanel } from '@backstage/core-components';

import { HeatmapTableByGroup } from './HeatmapTableByGroup';
import { HeatmapTableByLevels } from './HeatmapTableByLevels';
import { HeatmapTableByService } from './HeatmapTableByService';
import { LevelsDrivenTable } from './LevelsDrivenTable';
import {
  getScorecardServiceScoresByGroupByOption,
  getSortedRuleNames,
} from '../HeatmapUtils';
import { getSortedLadderLevelNames } from '../../../../utils/ScorecardLadderUtils';

import {
  GroupByOption,
  HeaderType,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../../api/types';

interface SingleScorecardHeatmapTableProps {
  groupBy: GroupByOption;
  headerType: HeaderType;
  scores: ScorecardServiceScore[];
  ladder: ScorecardLadder | undefined;
}

export const SingleScorecardHeatmapTable = ({
  groupBy,
  headerType,
  scores,
  ladder,
}: SingleScorecardHeatmapTableProps) => {
  const levelsDriven = headerType === HeaderType.LEVELS;
  const headers = useMemo(
    () =>
      (!isUndefined(ladder) && levelsDriven
        ? getSortedLadderLevelNames(ladder)
        : scores[0] && getSortedRuleNames(scores[0])) ?? [],
    [levelsDriven, ladder, scores],
  );

  const data = useMemo(() => {
    return getScorecardServiceScoresByGroupByOption(scores, groupBy);
  }, [scores, groupBy]);

  if (headerType === HeaderType.LEVELS) {
    if (isUndefined(ladder)) {
      return (
        <WarningPanel
          severity="error"
          title="Scorecard has no levels defined."
        />
      );
    } else {
      return (
        <LevelsDrivenTable levels={headers} groupBy={groupBy} data={data} />
      );
    }
  }

  switch (groupBy) {
    case GroupByOption.SCORECARD:
      return <HeatmapTableByService rules={headers} data={data} />;
    case GroupByOption.SERVICE_GROUP:
      return (
        <HeatmapTableByGroup
          header="Service Group"
          rules={headers}
          data={data}
        />
      );
    case GroupByOption.TEAM:
      return <HeatmapTableByGroup header="Team" rules={headers} data={data} />;
    case GroupByOption.LEVEL:
      return (
        <HeatmapTableByLevels ladder={ladder} rules={headers} data={data} />
      );
    default:
      return <>Hi</>;
  }
};
