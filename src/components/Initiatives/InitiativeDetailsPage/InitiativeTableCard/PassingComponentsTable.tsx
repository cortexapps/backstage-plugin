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
import { InfoCard } from '@backstage/core';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core';
import { useDetailCardStyles } from '../../../../styles/styles';
import Box from '@material-ui/core/Box';
import { Gauge } from '../../../Gauge';
import { DefaultEntityRefLink } from '../../../DefaultEntityLink';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultEntityRefContext } from '../../../../utils/ComponentUtils';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useActionItemsStyles } from './FailingComponentsTableRow';

interface PassingComponentsTableProps {
  componentRefs: string[];
  numRules: number;
}

export const PassingComponentsTable = ({
  componentRefs,
  numRules,
}: PassingComponentsTableProps) => {
  const classes = useDetailCardStyles();
  const actionItemsClasses = useActionItemsStyles();

  return (
    <InfoCard title="Passing" className={classes.root}>
      <Table>
        <TableBody>
          {componentRefs.map(componentRef => (
            <TableRow key={componentRef}>
              <TableCell className={actionItemsClasses.openIcon}>
                <IconButton size="small">
                  <KeyboardArrowDownIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                <Box
                  flexDirection="row"
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <Box alignSelf="center" width={1 / 8}>
                    <Gauge
                      value={1}
                      textOverride={`${numRules} / ${numRules}`}
                      strokeWidth={8}
                      trailWidth={8}
                    />
                  </Box>
                  <Box alignSelf="center">
                    <DefaultEntityRefLink
                      entityRef={parseEntityName(
                        componentRef,
                        defaultEntityRefContext,
                      )}
                    />
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </InfoCard>
  );
};
