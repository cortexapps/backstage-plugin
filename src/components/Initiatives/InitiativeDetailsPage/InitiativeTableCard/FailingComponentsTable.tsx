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

import {
  EmptyState,
  InfoCard,
  Table as BSTable,
  TableColumn,
} from '@backstage/core-components';

import { InitiativeActionItem } from '../../../../api/types';
import { groupByString } from '../../../../utils/collections';
import { useDetailCardStyles } from '../../../../styles/styles';
import { FailingComponentsTableRow } from './FailingComponentsTableRow';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { Box } from '@material-ui/core';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../../api/userInsightTypes';

const columns: TableColumn[] = [
  {
    field: 'all',
    render: (data: {
      componentRef?: string;
      numRules?: number;
      actionItems?: InitiativeActionItem[];
      title?: string;
    }) => {
      return (
        <FailingComponentsTableRow
          componentRef={data.componentRef ?? ''}
          actionItems={data.actionItems ?? []}
          numRules={data.numRules ?? 0}
          title={data.title}
        />
      );
    },
    customFilterAndSearch: (filter, rowData: { serviceName?: string }) => {
      return rowData.serviceName?.indexOf(filter) !== -1;
    },
    sorting: false,
    title: '',
  },
];

interface FailingComponentsTableProps {
  actionItems: InitiativeActionItem[];
  defaultPageSize?: number;
  entitiesByTag: StringIndexable<HomepageEntity>;
  numRules: number;
}

export const FailingComponentsTable = ({
  actionItems,
  defaultPageSize = 15,
  entitiesByTag,
  numRules,
}: FailingComponentsTableProps) => {
  const classes = useDetailCardStyles();

  const failingComponents = groupByString(
    actionItems,
    actionItem => actionItem.componentRef,
  );

  const data = useMemo(() => {
    return Object.keys(failingComponents)
      .map(componentRef => {
        const serviceName = humanizeAnyEntityRef(
          componentRef,
          defaultComponentRefContext,
        );
        return {
          actionItems: failingComponents[componentRef],
          componentRef,
          numRules,
          serviceName,
          title: entitiesByTag[componentRef]?.name,
        };
      })
      .sort((left, right) => left.actionItems.length - right.actionItems.length)
      .sort((left, right) => left.serviceName.localeCompare(right.serviceName));
  }, [entitiesByTag, failingComponents, numRules]);

  const showPagination = useMemo(() => {
    return Object.keys(failingComponents).length > defaultPageSize;
  }, [failingComponents, defaultPageSize]);

  if (data.length === 0) {
    return (
      <InfoCard title="Failing" className={classes.root}>
        <EmptyState missing="data" title="No failing services." />
      </InfoCard>
    );
  }

  return (
    <Box marginBottom={3}>
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
    </Box>
  );
};
