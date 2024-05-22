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
import { HeatmapReportGroupBy, HeatmapReportType } from '../../../api/types';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useAllScorecardHeatmapItems } from './useAllScorecardHeatmapItems';
import { Table } from '@material-ui/core';
import { BirdsEyeTableHeader } from './BirdsEyeTableHeader';
import { useCortexApi } from '../../../utils/hooks';
import { BirdsEyeTableRow, TableHeaderItem } from './BirdsEyeTableRow';

export interface BirdsEyeTableProps {
  entityCategory?: string;
  scorecardId: number;
  groupBy: HeatmapReportGroupBy;
  reportType: HeatmapReportType;
}

export const BirdsEyeTable: React.FC<BirdsEyeTableProps> = ({ entityCategory, scorecardId, groupBy, reportType }) => {
  const { values: heatmapItems, loading, error } = useAllScorecardHeatmapItems({ scorecardId, groupBy, reportType });
  const { value: ladders, loading: loadingLadders } = useCortexApi((api) => api.getScorecardLadders(scorecardId));

  const headersById = useMemo(() => {
    const levelNamesById: TableHeaderItem[] = [];
    const ruleNamesById: TableHeaderItem[] = [];

    if (groupBy !== HeatmapReportGroupBy.Entity) {
      levelNamesById.push(
        { id: "-1", title: "No Level" }
      );
    }

    if (ladders) {
      ladders.forEach((ladder) => {
        ladder.levels.forEach((level) => {
          levelNamesById.push(
            { id: level.id, title: level.name }
          );
          level.rules.forEach((rule) => {
            ruleNamesById.push(
              { id: rule.id, title: rule.title ?? rule.expression }
            );
          });
        });
      });
    }

    return reportType === HeatmapReportType.Levels ? levelNamesById : ruleNamesById;
  }, [ladders, reportType, groupBy]);

  const headers = useMemo(() => {
    const headers = [
      groupBy === HeatmapReportGroupBy.Entity
        ? `${entityCategory} Details`
        : Object.keys(HeatmapReportGroupBy)[Object.values(HeatmapReportGroupBy).indexOf(groupBy)],
    ];

    if (reportType === HeatmapReportType.Rules) {
      headers.push("Score");
    }

    headersById.forEach((headerById) => {
      headers.push(headerById.title);
    });

    return headers;
  }, [entityCategory, groupBy, reportType, headersById]);

  return (
    loading || loadingLadders
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
              <BirdsEyeTableRow key={item.key.tag} item={item} headersById={headersById} />
            ))}
          </Table>
        )
  )
}
