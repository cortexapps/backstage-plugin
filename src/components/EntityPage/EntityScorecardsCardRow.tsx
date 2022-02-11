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
import { ServiceScorecardScore } from '../../api/types';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Gauge } from '../Gauge';
import { BackstageTheme } from '@backstage/theme';
import { ScorecardServiceRefLink } from '../ScorecardServiceRefLink';

const useStyles = makeStyles<BackstageTheme, EntityScorecardsCardRowProps>(
  theme => ({
    tableRow: {
      '&:hover': {
        background: `${theme.palette.background.default}!important`,
      },
    },
    unselected: {
      background: `${theme.palette.background.paper}!important`,
    },
    selected: {
      background: `${theme.palette.background.default}!important`,
    },
  }),
);

interface EntityScorecardsCardRowProps {
  componentRef: string;
  score: ServiceScorecardScore;
  selected: boolean;
  onSelect: () => void;
}

export const EntityScorecardsCardRow = (
  props: EntityScorecardsCardRowProps,
) => {
  const { componentRef, score, onSelect } = props;
  const classes = useStyles(props);

  return (
    <React.Fragment>
      <TableRow
        className={`${classes.tableRow} ${
          props.selected ? classes.selected : classes.unselected
        }`}
        onClick={onSelect}
      >
        <TableCell>
          <Box
            flexDirection="row"
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Box alignSelf="center" width={1 / 4}>
              <Gauge
                value={score.score.scorePercentage}
                strokeWidth={8}
                trailWidth={8}
              />
            </Box>
            <Box alignSelf="center">
              <ScorecardServiceRefLink
                scorecardId={score.scorecard.id}
                componentRef={componentRef}
              >
                <b>{score.scorecard.name}</b>
              </ScorecardServiceRefLink>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
