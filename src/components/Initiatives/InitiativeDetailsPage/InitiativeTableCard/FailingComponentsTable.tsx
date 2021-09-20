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
import React from 'react';
import { InitiativeActionItem } from '../../../../api/types';
import { InfoCard } from '@backstage/core';
import { Table, TableBody } from '@material-ui/core';
import { groupByString } from '../../../../utils/collections';
import { useDetailCardStyles } from '../../../../styles/styles';
import { FailingComponentsTableRow } from './FailingComponentsTableRow';

interface FailingComponentsTableProps {
  actionItems: InitiativeActionItem[];
  numRules: number;
}

export const FailingComponentsTable = ({
  actionItems,
  numRules,
}: FailingComponentsTableProps) => {
  const classes = useDetailCardStyles();

  const failingComponents = groupByString(
    actionItems,
    actionItem => actionItem.componentRef,
  );

  return (
    <InfoCard title="Failing" className={classes.root}>
      <Table>
        <TableBody>
          {Object.keys(failingComponents).map(componentRef => (
            <FailingComponentsTableRow
              key={componentRef}
              componentRef={componentRef}
              actionItems={failingComponents[componentRef]}
              numRules={numRules}
            />
          ))}
        </TableBody>
      </Table>
    </InfoCard>
  );
};
