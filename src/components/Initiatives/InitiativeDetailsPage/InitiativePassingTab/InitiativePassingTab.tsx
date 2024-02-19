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
import { EmptyState, InfoCard, Table as BSTable, TableColumn, } from '@backstage/core-components';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { Box, ThemeProvider, Typography } from '@material-ui/core';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { LinearProgressWithLabel } from '../../../Common/LinearProgressWithLabel';
import {
  InitiativePassingTabRowProps,
  passingTabTheme,
  useInitiativePassingTabStyle,
} from './InitiativePassingTabConfig';
import { ServiceNameColumn } from './ServiceNameColumn';
import { InitiativeActionItem } from '../../../../api/types';

interface InitiativePassingTabProps {
  actionItems: InitiativeActionItem[];
  componentRefs: string[];
  defaultPageSize?: number;
  entitiesByComponentRef: StringIndexable<HomepageEntity>;
  numRules: number;
  scorecardId: number;
}

export const InitiativePassingTab: React.FC<InitiativePassingTabProps> = ({
  actionItems,
  componentRefs,
  defaultPageSize = 15,
  entitiesByComponentRef,
  numRules = 2,
  scorecardId,
}) => {
  const classes = useInitiativePassingTabStyle();

  const passingComponents = useMemo(
    () =>
      componentRefs.filter(componentRef =>
        actionItems.every(
          actionItem => actionItem.componentRef !== componentRef,
        ),
      ),
    [actionItems, componentRefs],
  );

  const data = useMemo(() => {
    return passingComponents
      .map(componentRef => {
        const tag = humanizeAnyEntityRef(
          componentRef,
          defaultComponentRefContext,
        );
        const { name, description } = entitiesByComponentRef[componentRef];

        return {
          componentRef,
          description,
          name,
          tag,
        };
      })
      .sort((left, right) => left.tag.localeCompare(right.tag));
  }, [entitiesByComponentRef, passingComponents]);

  const showPagination = useMemo(
    () => componentRefs.length > defaultPageSize,
    [componentRefs, defaultPageSize],
  );

  const columns: TableColumn<InitiativePassingTabRowProps>[] = useMemo(
    () => [
      {
        field: 'all',
        title: 'Service name',
        width: '60%',
        render: (data: InitiativePassingTabRowProps) => {
          return <ServiceNameColumn {...data} scorecardId={scorecardId} />;
        },
        customSort: (
          data1: InitiativePassingTabRowProps,
          data2: InitiativePassingTabRowProps,
        ) => {
          return data2.name.localeCompare(data1.name);
        },
        customFilterAndSearch: (
          filter,
          rowData: InitiativePassingTabRowProps,
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
          data1: InitiativePassingTabRowProps,
          data2: InitiativePassingTabRowProps,
        ) => {
          return data2.tag.localeCompare(data1.tag);
        },
        customFilterAndSearch: (
          filter: string,
          rowData: InitiativePassingTabRowProps,
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
        sorting: false,
        title: 'Score',
        width: '15%',
        render: () => {
          return (
            <Box sx={{ width: 120 }}>
              <LinearProgressWithLabel
                value={100}
                label={`${numRules} / ${numRules}`}
              />
            </Box>
          );
        },
      },
    ],
    [classes, numRules, scorecardId],
  );

  if (data.length === 0) {
    return (
      <InfoCard title="Passing">
        <EmptyState missing="data" title="No passing services." />
      </InfoCard>
    );
  }

  return (
    <Box marginBottom={3}>
      <ThemeProvider theme={passingTabTheme}>
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
          title="Passing"
        />
      </ThemeProvider>
    </Box>
  );
};
