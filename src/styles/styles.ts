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
import { createStyles, makeStyles, Theme } from '@material-ui/core';

export enum Status {
  OKAY,
  WARNING,
  ERROR,
}

export const percentageToStatus = (percentage: number) => {
  if (percentage > 0.9) {
    return Status.OKAY;
  } else if (percentage > 0.49) {
    return Status.WARNING;
  }
  return Status.ERROR;
};

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
    scoreGauge: {},
  });

const detailCardStyles = createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  rule: {
    marginBottom: '2px',
  },
  level: {
    marginBottom: '2px',
    alignItems: 'center',
  },
});

export const fallbackPalette = {
  status: {
    ok: '#71CF88',
    warning: '#FFB84D',
    error: '#F84C55',
    running: '#3488E3',
    pending: '#FEF071',
    aborted: '#9E9E9E',
  },
  error: {
    dark: '#F44336',
  },
  background: {
    paper: '#FFFFFF',
  },
  text: {
    secondary: '#6C757D',
  },
  common: {
    white: '#FFFFFF',
  },
};

export const useCortexStyles = makeStyles(cortexStyles);
export const useDetailCardStyles = makeStyles(detailCardStyles);
