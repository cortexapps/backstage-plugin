/*
 * Copyright 2022 Cortex Applications, Inc.
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
import { InitiativeActionItem, RuleOutcomeType } from '../../../../api/types';
import { Collapse, IconButton, Typography } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';
import { Gauge } from '../../../Gauge';
import { parseEntityRef } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../../utils/ComponentUtils';
import { DefaultEntityRefLink } from '../../../DefaultEntityLink';
import { ScorecardResultDetails } from '../../../Scorecards/ScorecardDetailsPage/ScorecardsTableCard/ScorecardResultDetails';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

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
  const [isOpen, setOpen] = useState(false);
  const entityName = parseEntityRef(componentRef, defaultComponentRefContext);

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Box>
          <IconButton size="small" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowRight />}
          </IconButton>
        </Box>

        <Box paddingLeft={6}>
          <Gauge
            value={(numRules - actionItems.length) / numRules}
            textOverride={`${numRules - actionItems.length} / ${numRules}`}
            strokeWidth={10}
            trailWidth={10}
          />
        </Box>

        <Box paddingLeft={2}>
          <DefaultEntityRefLink entityRef={entityName} />
        </Box>
      </Box>

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <>
          <Typography variant="h6" style={{ marginTop: '10px' }}>
            Action Items
          </Typography>
          <ScorecardResultDetails
            ruleOutcomes={actionItems.map(actionItem => {
              return {
                rule: actionItem.rule,
                score: 0,
                type: RuleOutcomeType.APPLICABLE,
              };
            })}
          />
        </>
      </Collapse>
    </Box>
  );
};
