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
import React from 'react';
import { Scorecard } from '../../../api/types';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardRouteRef } from '../../../routes';
import { ListCard } from '../../ListCard';
import { useUiExtensions } from '../../../utils/hooks';

type ScorecardCardProps = {
  scorecard: Scorecard;
};

export const ScorecardCard = ({ scorecard }: ScorecardCardProps) => {
  const scorecardRef = useRouteRef(scorecardRouteRef);

  const { uiExtensions } = useUiExtensions();
  const customCardDisplayOptions = uiExtensions?.scorecards?.cardDisplayOptions;

  return (
    <ListCard
      badges={customCardDisplayOptions?.getBadgesFn?.(scorecard)}
      description={scorecard.description}
      name={scorecard.name}
      truncateToCharacters={200}
      url={scorecardRef({ id: `${scorecard.id}` })}
    />
  );
};
