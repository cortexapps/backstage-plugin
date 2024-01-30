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
import { isNil } from 'lodash';
import { Moment } from 'moment';
import React, { PropsWithChildren, useMemo } from 'react';

import { Tooltip } from '@material-ui/core';

interface HoverTimestampProps extends PropsWithChildren {
  id?: string; // Unique id for tooltip target
  ts: Moment;
}

export const HoverTimestamp: React.FC<HoverTimestampProps> = ({
  children,
  id,
  ts,
}) => {
  const local = useMemo(() => ts.local(), [ts]);

  const hoverText = useMemo(
    () => local.format('dddd, MM/DD/YYYY, HH:mm:ss'),
    [local],
  );

  return (
    <Tooltip title={hoverText} arrow id={id}>
      <span>{isNil(children) ? local.fromNow() : children}</span>
    </Tooltip>
  );
};
