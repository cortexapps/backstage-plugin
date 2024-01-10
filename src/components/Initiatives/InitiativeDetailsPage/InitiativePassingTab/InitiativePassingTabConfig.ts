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

import { BackstageTheme, darkTheme } from '@backstage/theme';
import { makeStyles } from '@material-ui/core';

export interface InitiativePassingTabRowProps {
  componentRef: string;
  tag: string;
  name: string;
  description?: string;
}

export const useInitiativePassingTabStyle = makeStyles(() => ({
  tag: {
    fontFamily: 'Monospace',
    fontSize: 12,
  },
}));

export const passingTabTheme: BackstageTheme = {
  ...darkTheme,
  overrides: {
    ...darkTheme.overrides,
    MuiTableCell: {
      ...darkTheme.overrides?.MuiTableCell,
      root: {
        ...darkTheme.overrides?.MuiTableCell?.root,
        verticalAlign: 'top',
      },
    },
  },
};
