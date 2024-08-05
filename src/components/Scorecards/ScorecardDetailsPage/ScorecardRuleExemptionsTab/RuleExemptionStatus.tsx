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

import { makeStyles, Box, Typography } from '@material-ui/core';
import classnames from 'classnames';
import React from 'react';
import { ExemptionStatusResponseType } from '../../../../api/types';
import { fallbackPalette } from '../../../../styles/styles';

export interface RuleExemptionStatusProps {
  type: ExemptionStatusResponseType;
}

const useRuleExemptionStyles = makeStyles(theme => ({
  root: {
    display: 'block',
    width: 100,
    padding: theme.spacing(0.5, 1),
    marginRight: theme.spacing(1),
  },
  pending: {
    backgroundColor: fallbackPalette.common.grayLight,
  },
  approved: {
    backgroundColor: fallbackPalette.common.orange[100],
  },
  text: {
    color: fallbackPalette.common.black,
  },
}));

const typeToNameMap: Record<ExemptionStatusResponseType, string> = {
  [ExemptionStatusResponseType.APPROVED]: 'Exempt',
  [ExemptionStatusResponseType.PENDING]: 'Requested',
  [ExemptionStatusResponseType.REJECTED]: 'Rejected',
};

export const RuleExemptionStatus: React.FC<RuleExemptionStatusProps> = ({
  type,
}) => {
  const classes = useRuleExemptionStyles();

  return (
    <Box
      className={classnames(classes.root, {
        [classes.approved]: type === ExemptionStatusResponseType.APPROVED,
        [classes.pending]: type === ExemptionStatusResponseType.PENDING,
      })}
    >
      <Typography variant="body2" className={classes.text}>
        {typeToNameMap[type]}
      </Typography>
    </Box>
  );
};
