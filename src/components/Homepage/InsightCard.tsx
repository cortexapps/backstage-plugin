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
import { InfoCard } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { useHomepageInsightsStyles } from '../../styles/styles';

interface InsightCardProps {
  children: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ children }) => {
  const classes = useHomepageInsightsStyles();

  return (
    <InfoCard title="Insight" className={classes.root}>
      <Typography>{children}</Typography>
    </InfoCard>
  );
};

export default InsightCard;
