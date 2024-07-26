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
import { useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';
import { Link, MarkdownContent } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import {
  scorecardRouteRef,
  scorecardServiceDetailsRouteRef,
} from '../../../routes';
import Box from '@material-ui/core/Box';
import { DefaultEntityRefLink } from '../../DefaultEntityLink';
import { Scorecard, ScorecardServiceScore } from '../../../api/types';
import { cortexScorecardServicePageUrl } from '../../../utils/URLUtils';
import { useCortexFrontendUrl, useHideCortexLinks } from '../../../utils/hooks';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { isNil } from 'lodash';
import moment from 'moment';
import { HoverTimestamp } from '../../Common/HoverTimestamp';
import { StringIndexable } from '../../ReportsPage/HeatmapPageOld/HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { Truncated } from '../../Common/Truncated';

interface ScorecardServiceHeaderProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  score: ScorecardServiceScore;
  scorecard: Scorecard;
}

export const ScorecardServiceHeader = ({
  entitiesByTag,
  score,
  scorecard,
}: ScorecardServiceHeaderProps) => {
  const { scorecardId, kind, namespace, name } = useRouteRefParams(
    scorecardServiceDetailsRouteRef,
  );
  const entityRef = { kind, namespace, name };
  const scorecardRef = useRouteRef(scorecardRouteRef);
  const cortexBaseUrl = useCortexFrontendUrl();
  const lastEvaluation = useMemo(() => {
    return !isNil(score) ? moment.utc(score.lastUpdated) : undefined;
  }, [score]);

  const hideLink = useHideCortexLinks();

  return (
    <Box>
      <Box display="flex" flexDirection="row" mb={2}>
        <Link to={scorecardRef({ id: `${scorecardId}` })}>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <KeyboardArrowLeft />
            <b>Back to Scorecard</b>
          </Box>
        </Link>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        mb={3}
      >
        <Box alignSelf="center" flex="1">
          <Box mb={1}>
            <Typography variant="h4" component="h2">
              <DefaultEntityRefLink
                entityRef={entityRef}
                title={entitiesByTag[entityRef.name]?.name}
              />
            </Typography>
          </Box>
          {scorecard.description && (
            <Box mb={1}>
            <Truncated
              text={scorecard.description}
              truncateToLines={10}
              renderText={(text) => (<MarkdownContent content={text}/>)}
            />
            </Box>
          )}
          {lastEvaluation && (
            <Typography component="span" variant="body2">
              Updated <HoverTimestamp ts={lastEvaluation} />
            </Typography>
          )}
        </Box>
        {!hideLink && <Box>
          <Link
            to={cortexScorecardServicePageUrl({
              scorecardId,
              serviceId: score.serviceId,
              cortexUrl: cortexBaseUrl,
            })}
            target="_blank"
          >
            <b>View in Cortex</b>
          </Link>
        </Box>}
      </Box>
    </Box>
  );
};
