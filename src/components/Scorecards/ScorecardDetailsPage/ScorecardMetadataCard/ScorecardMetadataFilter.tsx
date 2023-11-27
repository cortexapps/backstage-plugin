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
import { Scorecard } from '../../../../api/types';
import { Typography, makeStyles } from '@material-ui/core';
import { isEmpty, isNil } from 'lodash';
import { isNotNullOrEmpty, joinWithAnds } from '../../../../utils/strings';
import {
  getEntityCategoryFromFilter,
  getEntityGroupsFromFilter,
  getQueryFromFilter,
  getResourceTypesFromFilter,
} from './ScorecardMetadataUtils';

interface ScorecardMetadataFilterProps {
  scorecard: Scorecard;
}

const useStyles = makeStyles(() => ({
  ruleQuery: {
    fontFamily:
      'Soehne Mono, Input, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: 12,
  },
}));

const ScorecardMetadataFilter: React.FC<ScorecardMetadataFilterProps> = ({
  scorecard,
}) => {
  const classes = useStyles();
  const { filter } = scorecard;

  const entityCategory = getEntityCategoryFromFilter(filter);

  const [groups, excludedGroups] = useMemo(() => {
    return getEntityGroupsFromFilter(filter);
  }, [filter]);

  const [includingResourceTypes, resourceTypes] = useMemo(() => {
    return getResourceTypesFromFilter(filter);
  }, [filter]);

  const cqlQuery = useMemo(() => {
    return getQueryFromFilter(filter);
  }, [filter]);

  const hasFilter = useMemo(() => {
    return (
      !isEmpty(groups) ||
      !isEmpty(excludedGroups) ||
      isNotNullOrEmpty(cqlQuery) ||
      !isEmpty(resourceTypes)
    );
  }, [cqlQuery, excludedGroups, groups, resourceTypes]);

  if (!hasFilter) {
    return (
      <Typography variant={'body2'}>
        Applies to all {entityCategory.toLowerCase()}s
      </Typography>
    );
  }

  if (!isNil(cqlQuery)) {
    return (
      <Typography variant={'body2'}>
        Applies to all {entityCategory.toLowerCase()}s matching{' '}
        <Typography
          variant="body2"
          component="span"
          className={classes.ruleQuery}
        >
          {cqlQuery}
        </Typography>
      </Typography>
    );
  }

  if (!isEmpty(resourceTypes)) {
    return (
      <Typography variant={'body2'}>
        Applies to resources{' '}
        {includingResourceTypes ? 'of type ' : 'excluding types '}
        {joinWithAnds(resourceTypes)}
        {(!isEmpty(groups) || !isEmpty(excludedGroups)) && (
          <>
            {' '}
            in {isEmpty(groups) && ' all '} groups{' '}
            {!isEmpty(groups) && joinWithAnds(groups)}
            {!isEmpty(excludedGroups) && (
              <>, excluding {joinWithAnds(excludedGroups)}</>
            )}
          </>
        )}
      </Typography>
    );
  }

  return (
    <Typography variant={'body2'}>
      {isEmpty(groups) ? 'All' : <>Applies to {joinWithAnds(groups)}</>}{' '}
      {entityCategory.toLowerCase()}s
      {!isEmpty(excludedGroups) && (
        <>
          , excluding {entityCategory.toLowerCase()}s in{' '}
          {joinWithAnds(excludedGroups)}
        </>
      )}
    </Typography>
  );
};

export default ScorecardMetadataFilter;
