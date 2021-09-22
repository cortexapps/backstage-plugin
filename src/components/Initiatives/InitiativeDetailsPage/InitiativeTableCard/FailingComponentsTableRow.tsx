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
import React, { useState } from 'react';
import { InitiativeActionItem } from '../../../../api/types';
import {
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';
import { Gauge } from '../../../Gauge';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { DefaultEntityRefLink } from '../../../DefaultEntityLink';
import { ScorecardResultDetails } from '../../../Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';

export const useActionItemsStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset!important',
    },
    height: '35px',
  },
  openIcon: {
    width: '35px',
  },
  progress: {
    height: '64px',
    marginRight: '16px',
  },
});

interface FailingComponentsTableRowProps {
  componentRef: string;
  actionItems: InitiativeActionItem[];
  numRules: number;
}

export const FailingComponentsTableRow = ({
  componentRef,
  actionItems,
  numRules,
}: FailingComponentsTableRowProps) => {
  const classes = useActionItemsStyles();
  const [open, setOpen] = useState(false);
  const entityName = parseEntityName(componentRef, defaultComponentRefContext);

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell className={classes.openIcon}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
                value={(numRules - actionItems.length) / numRules}
                textOverride={`${numRules - actionItems.length} / ${numRules}`}
                strokeWidth={8}
                trailWidth={8}
              />
            </Box>
            <Box alignSelf="center">
              <DefaultEntityRefLink entityRef={entityName} />
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <>
              <Typography variant="h6" style={{ marginTop: '10px' }}>
                Action Items
              </Typography>
              <ScorecardResultDetails
                rules={actionItems.map(actionItem => {
                  return {
                    rule: actionItem.rule,
                    score: 0,
                  };
                })}
              />
            </>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
