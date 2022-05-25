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
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableCell,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { parseEntityRef } from '@backstage/catalog-model';

import { maybePluralize } from '../../../utils/strings';
import { defaultComponentRefContext } from '../../../utils/ComponentUtils';

import { ScorecardServiceScore } from '../../../api/types';
import { BackstageTheme } from '@backstage/theme';

const useStyles = makeStyles<BackstageTheme>(_ => ({
  componentList: {
    paddingLeft: '16px',
  },
}));

interface LevelsInfoCellProps {
  identifier: string;
  scores: ScorecardServiceScore[];
}

export const LevelsInfoCell = ({ identifier, scores }: LevelsInfoCellProps) => {
  const classes = useStyles();
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
        <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
          <ul className={classes.componentList}>
            {scores?.map(score => (
              <li key={`LevelService-${identifier}-${score.serviceId}`}>
                <EntityRefLink
                  entityRef={parseEntityRef(
                    score.componentRef,
                    defaultComponentRefContext,
                  )}
                />
              </li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
    </TableCell>
  );
};
