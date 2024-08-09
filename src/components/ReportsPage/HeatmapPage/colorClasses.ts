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
import { BackstageTheme } from '@backstage/theme';
import { makeStyles } from '@material-ui/core';

export const useColorCellStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    border: 'none',
    textAlign: 'center',
    minWidth: '100px',
    borderRadius: 0,
  },
  success1: {
    background: '#00ca9b',
    color: theme.palette.common.black,
  },
  success2: {
    background: '#60e6c7',
    color: theme.palette.common.black,
  },
  success3: {
    background: '#b0ecde',
    color: theme.palette.common.black,
  },
  warning1: {
    background: '#ffecb3',
    color: theme.palette.common.black,
  },
  warning2: {
    background: '#ffca28',
    color: theme.palette.common.black,
  },
  warning3: {
    background: '#ffa001',
    color: theme.palette.common.black,
  },
  danger1: {
    background: '#ffd6dd',
    color: theme.palette.common.black,
  },
  danger2: {
    background: '#fe899e',
    color: theme.palette.common.black,
  },
  danger3: {
    background: '#fd496a',
    color: theme.palette.common.black,
  },
}));
