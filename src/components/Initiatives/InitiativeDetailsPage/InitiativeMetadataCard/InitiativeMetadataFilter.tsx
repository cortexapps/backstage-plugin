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
import { Initiative } from '../../../../api/types';
import { Typography } from '@material-ui/core';
import { isEmpty } from 'lodash';
import {
  getEntityCategoryFromFilter,
  getEntityGroupsFromFilter,
} from '../../../Scorecards/ScorecardDetailsPage/ScorecardMetadataCard/ScorecardMetadataUtils';
import { joinWithAnds } from '../../../../utils/strings';

interface InitiativeMetadataFilterProps {
  initiative: Initiative;
}

const InitiativeMetadataFilter: React.FC<InitiativeMetadataFilterProps> = ({
  initiative,
}) => {
  const entityCategory = useMemo(
    () => getEntityCategoryFromFilter(initiative.scorecard?.filter),
    [initiative],
  );

  const { entityGroups, excludeEntityGroups } = useMemo(
    () => getEntityGroupsFromFilter(initiative.filter),
    [initiative.filter],
  );

  const hasIncludes = !isEmpty(entityGroups);
  const hasExcludes = !isEmpty(excludeEntityGroups);

  return (
    <Typography variant="body2">
      Applies to {!hasIncludes && !hasExcludes ? 'all' : ''}{' '}
      {entityCategory?.toLowerCase() || 'entitie'}s{' '}
      {(hasIncludes || hasExcludes) && (
        <>
          in {!hasIncludes && ' all '} groups{' '}
          {hasIncludes && joinWithAnds(entityGroups)}
          {hasExcludes && <>, excluding {joinWithAnds(excludeEntityGroups)}</>}
        </>
      )}
    </Typography>
  );
};

export default InitiativeMetadataFilter;
