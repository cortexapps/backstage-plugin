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
import { makeStyles } from '@material-ui/core';
import { fallbackPalette } from '../../../styles/styles';

const useScorecardServiceRuleRowStyle = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  expandIcon: {
    padding: 0,
  },
  ruleDescription: {
    margin: theme.spacing(1, 0),
    '& p': {
      margin: 0,
    },
  },
  ruleQuery: {
    color: fallbackPalette.common.gray,
    fontFamily: 'Monospace',
    fontSize: 12,
  },
}));

export default useScorecardServiceRuleRowStyle;
