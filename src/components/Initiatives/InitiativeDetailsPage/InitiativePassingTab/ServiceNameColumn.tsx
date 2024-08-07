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
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { ScorecardServiceRefLink } from '../../../ScorecardServiceRefLink';
import { InitiativePassingTabRowProps } from './InitiativePassingTabConfig';

export interface ServiceNameColumnProps extends InitiativePassingTabRowProps {
  scorecardId: number;
}

export const ServiceNameColumn: React.FC<ServiceNameColumnProps> = ({
  componentRef,
  scorecardId,
  name,
  description,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <ScorecardServiceRefLink
            scorecardId={scorecardId}
            componentRef={componentRef}
          >
            {name}
          </ScorecardServiceRefLink>
          {description && (
            <Typography variant="subtitle2">{description}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
