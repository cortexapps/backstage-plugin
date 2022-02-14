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
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableCell,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ScorecardServiceScore } from '../../../api/types';
import { maybePluralize } from '../../../utils/strings';
import { ExpandMore } from '@material-ui/icons';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityName } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../../utils/ComponentUtils';

interface LevelsInfoCellProps {
  identifier: string;
  scores: ScorecardServiceScore[];
}

export const LevelsInfoCell = ({ identifier, scores }: LevelsInfoCellProps) => {
  return (
    <TableCell>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          disabled={scores.length === 0}
        >
          <Typography variant="h6" style={{ display: 'inline-block' }}>
            {maybePluralize(scores.length, 'service')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {scores?.map(score => (
            <Typography
              key={`LevelService-${identifier}-${score.serviceId}`}
              variant="h6"
              style={{ display: 'inline-block' }}
            >
              <EntityRefLink
                entityRef={parseEntityName(
                  score.componentRef,
                  defaultComponentRefContext,
                )}
              />
              {score.serviceId}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    </TableCell>
  );
};
