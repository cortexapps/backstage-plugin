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
import React, {useMemo} from 'react';
import {GroupByOption, ScorecardServiceScore} from '../../../../api/types';
import {getScorecardServiceScoresByGroupByOption, getSortedRuleNames} from "../HeatmapUtils";
import {HeatmapTableByGroup} from "./HeatmapTableByGroup";
import {HeatmapTableByLevels} from "./HeatmapTableByLevels";
import {HeatmapTableByService} from "./HeatmapTableByService";

interface SingleScorecardHeatmapTableProps {
    scorecardId: string;
    groupBy: GroupByOption;
    scores: ScorecardServiceScore[]
}

export const SingleScorecardHeatmapTable = ({
                                                scorecardId,
                                                groupBy,
                                                scores,
                                            }: SingleScorecardHeatmapTableProps) => {
    const rules = useMemo(() => (scores[0] && getSortedRuleNames(scores[0])) ?? [], [scores]);
    const data = useMemo(() => {
        return getScorecardServiceScoresByGroupByOption(scores, groupBy);
    }, [scores, groupBy]);

    switch (groupBy) {
        case GroupByOption.SCORECARD:
            return <HeatmapTableByService rules={rules} data={data} />;
        case GroupByOption.SERVICE_GROUP:
        case GroupByOption.OWNER:
        case GroupByOption.TEAM:
            return <HeatmapTableByGroup rules={rules} data={data} />;
        case GroupByOption.LEVEL:
            return <HeatmapTableByLevels scorecardId={scorecardId} rules={rules} data={data} />;
        default:
            return <>Hi</>;
    }
};
