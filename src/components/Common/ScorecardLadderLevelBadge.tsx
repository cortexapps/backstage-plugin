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
import { Box, Tooltip, Typography } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';
import { fallbackPalette } from '../../styles/styles';

interface ScorecardLadderLevelBadgeProps {
  name?: string;
  color?: string;
  showName?: boolean;
}

export const ScorecardLadderLevelBadge = ({
  name = 'No Level',
  color,
  showName,
}: ScorecardLadderLevelBadgeProps) => (
  <Tooltip title={name}>
    <Box display="flex" flexDirection="row" alignItems={'center'}>
      <StarIcon
        style={{
          color: `${color ?? fallbackPalette.common.grayLight}`,
          marginRight: 8,
        }}
      />
      {showName && <Typography variant="body2">{name}</Typography>}
    </Box>
  </Tooltip>
);
