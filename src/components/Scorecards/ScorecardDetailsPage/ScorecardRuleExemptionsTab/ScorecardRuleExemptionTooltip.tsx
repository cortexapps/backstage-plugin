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
import { Box } from '@material-ui/core';
import { isEmpty } from 'lodash';
import React from 'react';
import { RuleExemptionResponse } from '../../../../api/types';
import {
  getExemptionApprovedDetailsText,
  getExemptionRejectedDetailsText,
  getExemptionRequestedDetailsText,
  isRejectedStatus,
} from './ScorecardRuleExemptionsTabUtils';
import { CaptionTypography } from '../../../Common/StatsItem';

interface ScorecardRuleExemptionTooltipProps {
  exemption: RuleExemptionResponse;
}

const ScorecardRuleExemptionTooltip: React.FC<ScorecardRuleExemptionTooltipProps> =
  ({ exemption }) => {
    const approvedText = getExemptionApprovedDetailsText(exemption);
    const rejectedText = getExemptionRejectedDetailsText(exemption);

    const { status } = exemption;

    return (
      <Box display="flex" flexDirection="column">
        {!isEmpty(exemption.requestingReason) && (
          <Box display="flex" flexDirection="row" gridGap={4}>
            <CaptionTypography variant="caption">
              Exemption Reason
            </CaptionTypography>
            <CaptionTypography variant="caption">
              {exemption.requestingReason}
            </CaptionTypography>
          </Box>
        )}
        {isRejectedStatus(status) && !isEmpty(status.reason) && (
          <Box display="flex" flexDirection="row" gridGap={4}>
            <CaptionTypography variant="caption">
              Rejection Reason
            </CaptionTypography>
            <CaptionTypography variant="caption">
              {status.reason}
            </CaptionTypography>
          </Box>
        )}
        <CaptionTypography variant="caption">
          {getExemptionRequestedDetailsText(exemption)}
        </CaptionTypography>
        {approvedText && (
          <CaptionTypography variant="caption">
            {approvedText}
          </CaptionTypography>
        )}
        {rejectedText && (
          <CaptionTypography variant="caption">
            {rejectedText}
          </CaptionTypography>
        )}
      </Box>
    );
  };

export default ScorecardRuleExemptionTooltip;
