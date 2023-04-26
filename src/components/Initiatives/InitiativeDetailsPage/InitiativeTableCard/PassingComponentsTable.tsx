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

import { parseEntityRef } from '@backstage/catalog-model';
import {
  EmptyState,
  InfoCard,
  Table as BSTable,
  TableColumn,
} from '@backstage/core-components';
import { IconButton } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';

import { useDetailCardStyles } from '../../../../styles/styles';
import { Gauge } from '../../../Gauge';
import { DefaultEntityRefLink } from '../../../DefaultEntityLink';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { humanizeAnyEntityRef } from '../../../../utils/types';
import { HomepageEntity } from '../../../../api/userInsightTypes';
import { StringIndexable } from '../../../ReportsPage/HeatmapPage/HeatmapUtils';

const columns: TableColumn[] = [
  {
    field: 'all',
    render: (data: {
      componentRef?: string;
      numRules?: number;
      serviceName?: string;
      title?: string;
    }) => {
      return (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box>
            <IconButton size="small">
              <KeyboardArrowDownIcon />
            </IconButton>
          </Box>

          <Box paddingLeft={6}>
            <Gauge
              value={1}
              textOverride={`${data?.numRules} / ${data?.numRules}`}
              strokeWidth={10}
              trailWidth={10}
            />
          </Box>
          <Box paddingLeft={2}>
            <DefaultEntityRefLink
              entityRef={parseEntityRef(
                data.componentRef ?? '',
                defaultComponentRefContext,
              )}
              title={data.title}
            />
          </Box>
        </Box>
      );
    },
    customFilterAndSearch: (filter, rowData: { serviceName?: string }) => {
      return rowData.serviceName?.indexOf(filter) !== -1;
    },
    sorting: false,
    title: '',
  },
];

interface PassingComponentsTableProps {
  componentRefs: string[];
  defaultPageSize?: number;
  entitiesByTag: StringIndexable<HomepageEntity>;
  numRules: number;
}

export const PassingComponentsTable = ({
  componentRefs,
  defaultPageSize = 15,
  entitiesByTag,
  numRules,
}: PassingComponentsTableProps) => {
  const classes = useDetailCardStyles();

  const data = useMemo(() => {
    return componentRefs
      .map(componentRef => {
        const serviceName = humanizeAnyEntityRef(
          componentRef,
          defaultComponentRefContext,
        );
        return {
          componentRef,
          numRules,
          serviceName, // for custom filtering
          title: entitiesByTag[componentRef]?.name,
          toggle: null,
        };
      })
      .sort((left, right) => left.serviceName.localeCompare(right.serviceName));
  }, [componentRefs, entitiesByTag, numRules]);

  const showPagination = useMemo(
    () => componentRefs.length > defaultPageSize,
    [componentRefs, defaultPageSize],
  );

  if (data.length === 0) {
    return (
      <InfoCard title="Passing" className={classes.root}>
        <EmptyState missing="data" title="No passing services." />
      </InfoCard>
    );
  }

  return (
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
  );
};
