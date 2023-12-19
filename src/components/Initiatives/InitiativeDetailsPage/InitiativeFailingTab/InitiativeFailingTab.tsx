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
import { InitiativeActionItem } from '../../../../api/types';
import { ServiceNameAndRulesColumn } from './ServiceNameAndRulesColumn';
import {
  TableColumn,
  Table as BSTable,
  EmptyState,
  InfoCard,
} from '@backstage/core-components';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { Box, ThemeProvider, Typography } from '@material-ui/core';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { groupByString } from '../../../../utils/collections';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { LinearProgressWithLabel } from '../../../Common/LinearProgressWithLabel';
import { percentify } from '../../../../utils/NumberUtils';
import {
  InitiativeFailingTabRowProps,
  failingTabTheme,
  useInitiativeFailingTabStyle,
} from './InitiativeFailingTabConfig';

interface InitiativeFailingTabProps {
  actionItems: InitiativeActionItem[];
  defaultPageSize?: number;
  entitiesByTag: StringIndexable<HomepageEntity>;
  numRules?: number;
  scorecardId: number;
}

export const InitiativeFailingTab: React.FC<InitiativeFailingTabProps> = ({
  actionItems,
  defaultPageSize = 15,
  entitiesByTag,
  numRules = 2,
  scorecardId,
}) => {
  const classes = useInitiativeFailingTabStyle();

  const failingComponents = useMemo(
    () => groupByString(actionItems, actionItem => actionItem.componentRef),
    [actionItems],
  );

  const data: InitiativeFailingTabRowProps[] = useMemo(() => {
    return Object.keys(failingComponents)
      .map(componentRef => {
        const tag = humanizeAnyEntityRef(
          componentRef,
          defaultComponentRefContext,
        );

        const { name, description } = entitiesByTag[componentRef];
        const serviceActionItems = failingComponents[componentRef];

        return {
          actionItems: serviceActionItems,
          componentRef,
          description,
          name,
          tag,
          score: (numRules - serviceActionItems.length) / numRules,
        };
      })
      .sort((left, right) => left.actionItems.length - right.actionItems.length)
      .sort((left, right) => left.tag.localeCompare(right.tag));
  }, [entitiesByTag, failingComponents, numRules]);

  const showPagination = useMemo(() => {
    return Object.keys(failingComponents).length > defaultPageSize;
  }, [failingComponents, defaultPageSize]);

  const columns: TableColumn<InitiativeFailingTabRowProps>[] = useMemo(
    () => [
      {
        field: 'all',
        title: 'Service name',
        width: '75%',
        render: (data: InitiativeFailingTabRowProps) => {
          return (
            <ServiceNameAndRulesColumn {...data} scorecardId={scorecardId} />
          );
        },
        customSort: (
          data1: InitiativeFailingTabRowProps,
          data2: InitiativeFailingTabRowProps,
        ) => {
          return data2.name.localeCompare(data1.name);
        },
        customFilterAndSearch: (
          filter,
          rowData: InitiativeFailingTabRowProps,
        ) => {
          return (
            rowData.name?.includes(filter) ??
            rowData.tag?.includes(filter) ??
            false
          );
        },
        sorting: true,
      },
      {
        sorting: true,
        field: 'componentRef',
        title: 'Tag',
        width: '25%',
        customSort: (
          data1: InitiativeFailingTabRowProps,
          data2: InitiativeFailingTabRowProps,
        ) => {
          return data2.tag.localeCompare(data1.tag);
        },
        customFilterAndSearch: (
          filter: string,
          rowData: InitiativeFailingTabRowProps,
        ) => {
          return (
            rowData.componentRef
              .toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase()) ?? false
          );
        },
        render: ({ componentRef }: { componentRef?: string }) => (
          <Typography variant="subtitle2" className={classes.tag}>
            {componentRef}
          </Typography>
        ),
      },
      {
        field: 'score',
        sorting: true,
        title: 'Score',
        width: '20%',
        render: (data: InitiativeFailingTabRowProps) => {
          const actionItemsLength = data.actionItems?.length ?? 0;
          return (
            <Box sx={{ width: 120 }}>
              <LinearProgressWithLabel
                value={percentify(data.score)}
                label={`${numRules - actionItemsLength} / ${numRules}`}
              />
            </Box>
          );
        },
        customSort: (
          data1: InitiativeFailingTabRowProps,
          data2: InitiativeFailingTabRowProps,
        ) => {
          return data2.score - data1.score;
        },
      },
    ],
    [classes, numRules, scorecardId],
  );

  if (data.length === 0) {
    return (
      <InfoCard title="Failing">
        <EmptyState missing="data" title="No failing services." />
      </InfoCard>
    );
  }

  return (
    <Box marginBottom={3}>
      <ThemeProvider theme={failingTabTheme}>
        <BSTable
          columns={columns}
          data={data}
          options={{
            pageSize: defaultPageSize,
            pageSizeOptions: [
              defaultPageSize,
              defaultPageSize * 2,
              defaultPageSize * 4,
            ],
            paging: showPagination,
          }}
          title="Failing"
        />
      </ThemeProvider>
    </Box>
  );
};
