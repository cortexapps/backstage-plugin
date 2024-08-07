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
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardServiceDetailsRouteRef } from '../../routes';
import { Link } from '@backstage/core-components';
import { parseEntityRef } from '@backstage/catalog-model';
import { defaultComponentRefContext } from '../../utils/ComponentUtils';

interface ScorecardRefLinkProps {
  scorecardId: number;
  children?: React.ReactNode;
  componentRef: string;
}

export const ScorecardServiceRefLink = ({
  componentRef,
  scorecardId,
  children,
}: ScorecardRefLinkProps) => {
  const scorecardServiceDetailsRef = useRouteRef(
    scorecardServiceDetailsRouteRef,
  );

  const entityName = parseEntityRef(componentRef, defaultComponentRefContext);

  return (
    <Link
      to={scorecardServiceDetailsRef({
        scorecardId: `${scorecardId}`,
        ...entityName,
      })}
    >
      {children}
    </Link>
  );
};
