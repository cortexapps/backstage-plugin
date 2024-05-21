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
import { useEffect, useState } from 'react';
import { HeatmapReportGroupBy, HeatmapReportItem, HeatmapReportType } from '../../../api/types';
import { cortexApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';

interface UseAllScorecardHeatmapItemsProps {
  scorecardId: number;
  groupBy: HeatmapReportGroupBy;
  reportType: HeatmapReportType;
}

export function useAllScorecardHeatmapItems({
  scorecardId,
  groupBy,
  reportType
}: UseAllScorecardHeatmapItemsProps) {
  const [values, setValues] = useState<HeatmapReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);

  const cortexApi = useApi(cortexApiRef);

  useEffect(() => {
    setLoading(true);
    setError(undefined);

    const fetchAll = async () => {
      try {
        const firstPage = await cortexApi.getScorecardHeatmap(scorecardId, { groupBy, reportType, page: 0 });
        setValues(firstPage.items);

        if (firstPage.hasMore) {
          const pagePromises = [];
          for (let page = 1; page < firstPage.totalPages; page++) {
            pagePromises.push(
              cortexApi.getScorecardHeatmap(scorecardId, { groupBy, reportType, page })
            );
          }
          const pages = await Promise.all(pagePromises);
          pages.map((page) => setValues((prev) => [...prev, ...page.items]))
        }
      } catch (e) {
        setValues([]);
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [cortexApi, groupBy, reportType, scorecardId]);

  return { values, loading, error }
}
