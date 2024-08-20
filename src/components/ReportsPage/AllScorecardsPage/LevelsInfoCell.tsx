/*
 * Copyright 2024 Cortex Applications, Inc.
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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TableCell,
  Typography,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

import { maybePluralize } from '../../../utils/strings';
import {
  defaultComponentRefContext,
  entityComponentRef,
} from '../../../utils/ComponentUtils';

import { ScorecardServiceScore } from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface LevelsInfoCellProps {
  entitiesByTag: Record<string, HomepageEntity>;
  identifier: string;
  scores: ScorecardServiceScore[];
  classes: ClassNameMap<string>;
}

export const LevelsInfoCell = ({
  identifier,
  scores,
  entitiesByTag,
  classes,
}: LevelsInfoCellProps) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  return (
    <TableCell>
      <Accordion
        expanded={expanded}
        onChange={(_e, value) => setExpanded(value)}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          disabled={scores.length === 0}
        >
          <Typography variant="h6" style={{ display: 'inline-block' }}>
            {maybePluralize(scores.length, 'service')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
          {expanded && (
            <ul className={classes.componentList}>
              {scores?.map(score => (
                <li key={`LevelService-${identifier}-${score.serviceId}`}>
                  <EntityRefLink
                    entityRef={parseEntityRef(
                      entityComponentRef(entitiesByTag, score.componentRef),
                      defaultComponentRefContext,
                    )}
                  />
                </li>
              ))}
            </ul>
          )}
        </AccordionDetails>
      </Accordion>
    </TableCell>
  );
};
