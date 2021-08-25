/*
 * Copyright 2021 Cortex Applications, Inc.
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
import { createStyles, makeStyles, Theme } from "@material-ui/core";

const cortexStyles = (theme: Theme) =>
  createStyles({
    label: {
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontSize: '10px',
      fontWeight: 'bold',
      letterSpacing: 0.5,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    scoreGauge: {

    }
  });

const scorecardDetailCardStyles = createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  rule: {
    marginBottom: '2px',
  }
})

export const useCortexStyles = makeStyles(cortexStyles);
export const useScorecardDetailCardStyles = makeStyles(scorecardDetailCardStyles)
