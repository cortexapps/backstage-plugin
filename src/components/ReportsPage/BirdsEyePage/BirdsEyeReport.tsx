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
import React from 'react';
import { HeatmapReportGroupBy, HeatmapReportType } from '../../../api/types';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useAllScorecardHeatmapItems } from './useAllScorecardHeatmapItems';
import { Table, TableCell, TableRow } from '@material-ui/core';
import { BirdsEyeTableHeader } from './BirdsEyeTableHeader';

export interface BirdsEyeReportProps {
  entityCategory: string;
  scorecardId: number;
  groupBy: HeatmapReportGroupBy;
  reportType: HeatmapReportType;
}

export const BirdsEyeReport: React.FC<BirdsEyeReportProps> = ({ entityCategory, scorecardId, groupBy, reportType }) => {
  const { values: heatmapItems, loading, error } = useAllScorecardHeatmapItems({ scorecardId, groupBy, reportType });
  const headers = [entityCategory, "Score", "Data"];

  return (
    loading
      ? <Progress />
      : error
        ? (
          <WarningPanel severity="error" title="Could not load heatmap.">
            {error}
          </WarningPanel>
        ) : (
          <Table>
            <BirdsEyeTableHeader headers={headers} />
            {heatmapItems.map((item) => (
              <TableRow key={item.key.tag}>
                <TableCell>{item.key.name}</TableCell>
                {item.value.value ? (
                  <>
                    <TableCell></TableCell>
                    <TableCell>{JSON.stringify(item.value.value)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{item.value.ruleScores.scorePercentage}%</TableCell>
                    <TableCell>
                      {Object.keys(item.value.ruleResult.results).map((key) => (
                        <span key={`${item.key.tag}-${key}`} className="flex">
                          {item.value.ruleResult!.results[key].score}
                        </span>
                      ))}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </Table>
        )
  )
}
