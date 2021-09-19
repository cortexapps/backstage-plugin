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
import { makeStyles, useTheme } from '@material-ui/core';
import { BackstageTheme } from '@backstage/theme';
import { Circle } from 'rc-progress';
import React from 'react';
import { fallbackPalette } from '../../styles/styles';

const useStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    position: 'relative',
    lineHeight: 0,
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    fontWeight: 'bold',
    color: theme.palette?.text?.secondary ?? fallbackPalette.text.secondary,
  },
  circle: {
    width: '80%',
    transform: 'translate(10%, 0)',
  },
  colorUnknown: {},
}));

type Props = {
  value: number;
  fractional?: boolean;
  inverse?: boolean;
  unit?: string;
  max?: number;
  strokeWidth?: number;
  trailWidth?: number;
  textOverride?: string;
};

const defaultProps = {
  fractional: true,
  inverse: false,
  unit: '%',
  max: 100,
};

export function getProgressColor(
  palette: BackstageTheme['palette'],
  value: number,
  inverse?: boolean,
  max?: number,
) {
  if (isNaN(value)) {
    return '#DDDDDD';
  }

  const actualMax = max ? max : defaultProps.max;
  const actualValue = inverse ? actualMax - value : value;

  if (actualValue < actualMax / 3) {
    return palette.status?.error ?? fallbackPalette.status.error;
  } else if (actualValue < actualMax * (2 / 3)) {
    return palette.status?.warning ?? fallbackPalette.status.warning;
  }

  return palette.status?.ok ?? fallbackPalette.status.ok;
}

// TODO: Cut PR back upstream
export const Gauge = (props: Props) => {
  const classes = useStyles(props);
  const theme = useTheme<BackstageTheme>();
  const { value, fractional, inverse, unit, max, textOverride } = {
    ...defaultProps,
    ...props,
  };

  const asPercentage = fractional ? Math.round(value * max) : value;
  const asActual = max !== 100 ? Math.round(value) : asPercentage;

  return (
    <div className={classes.root}>
      <Circle
        strokeLinecap="butt"
        percent={asPercentage}
        strokeWidth={props.strokeWidth ?? 12}
        trailWidth={props.trailWidth ?? 12}
        strokeColor={getProgressColor(theme.palette, asActual, inverse, max)}
        className={classes.circle}
      />
      <div className={classes.overlay}>
        {textOverride ?? (isNaN(value) ? 'N/A' : `${asActual}${unit}`)}
      </div>
    </div>
  );
};
