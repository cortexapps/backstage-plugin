/*
 * Copyright 2023 Cortex Applications, Inc.
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
import React, { useMemo } from 'react';
import { percentify } from '../../utils/NumberUtils';
import { ordinal } from '../../utils/strings';
import { Box, Typography, alpha, withStyles } from '@material-ui/core';
import { fallbackPalette } from '../../styles/styles';

export type StatNumberType = 'NTH' | 'PERCENTAGE' | 'NONE';

export interface StatsItemProps {
  caption: string;
  percentage?: boolean;
  type?: StatNumberType;
  value: number;
}

export const CaptionTypography = withStyles({
  root: {
    color: alpha(fallbackPalette.common.white, 0.7),
  },
})(Typography);

const StatsItem: React.FC<StatsItemProps> = ({
  caption,
  percentage,
  type,
  value,
}) => {
  const calculatedValue = useMemo(
    () => (percentage ? percentify(value) : value),
    [value, percentage],
  );

  const suffix = useMemo(() => {
    switch (type) {
      case 'NTH':
        return ordinal(calculatedValue);
      case 'PERCENTAGE':
        return '%';
      case 'NONE':
      default:
        return undefined;
    }
  }, [calculatedValue, type]);

  return (
    <Box>
      <CaptionTypography variant="caption">{caption}</CaptionTypography>
      <Typography aria-label={caption}>
        {calculatedValue}
        {suffix}
      </Typography>
    </Box>
  );
};

export default StatsItem;
