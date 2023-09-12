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
import { Content, ContentHeader } from '@backstage/core-components';
import React, { useMemo, useState } from 'react';
import {
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
} from '../../../api/types';
import {
  Button,
  ButtonGroup,
  CardActions,
  Grid,
  Tab,
  Tabs,
} from '@material-ui/core';
import { ScorecardMetadataCard } from './ScorecardMetadataCard';
import { ScorecardRulesCard } from './ScorecardRulesCard';
import { Predicate } from '../../../utils/types';
import { ScorecardStatsCard } from './ScorecardStatsCard';
import { StringIndexable } from '../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import CopyCsvButton from './CopyCsvButton';
import ScorecardFilterDialog from './ScorecardFilterDialog';
import { ReportsPage } from '../../ReportsPage';
import { ScorecardsTableCard } from './ScorecardsTableCard';

export type ScorecardServiceScoreFilter = Predicate<ScorecardServiceScore>;

interface ScorecardDetailsProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  ladder: ScorecardLadder | undefined;
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

type TabComponentProps = {
  entitiesByTag: StringIndexable<HomepageEntity>;
  scorecard: Scorecard;
  ladder: ScorecardLadder | undefined;
  scores: ScorecardServiceScore[];
};

type ActiveTab = {
  label: string;
  render: (props: TabComponentProps) => JSX.Element;
};

export const ScorecardDetailsTab = {
  Scores: {
    label: 'Scores',
    render: (props: TabComponentProps) => (
      <ScorecardsTableCard
        entitiesByTag={props.entitiesByTag}
        scorecardId={props.scorecard.id}
        scores={props.scores}
      />
    ),
  },
  Rules: {
    label: 'Rules',
    render: (props: TabComponentProps) => (
      <ScorecardRulesCard scorecard={props.scorecard} ladder={props.ladder} />
    ),
  },
  Reports: {
    label: 'Reports',
    render: () => <ReportsPage />,
  },
  Exemptions: {
    label: 'Rule exemptions',
    render: (props: TabComponentProps) => (
      <ScorecardRulesCard scorecard={props.scorecard} ladder={props.ladder} />
    ),
  },
};

export const ScorecardDetails = ({
  entitiesByTag,
  ladder,
  scorecard,
  scores,
}: ScorecardDetailsProps) => {
  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => ScorecardServiceScoreFilter>(
    () => () => true,
  );

  const [isFilterDialogOpen, setFilterDialogOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(ScorecardDetailsTab.Scores);

  const filteredScores = useMemo(() => {
    return scores.filter(filter);
  }, [scores, filter]);

  const handleTabChange = (
    _event: React.ChangeEvent<{}>,
    newValue: ActiveTab,
  ) => {
    setActiveTab(newValue);
  };

  const handleFilterDialogClose = () => {
    setFilterDialogOpen(false);
  };

  return (
    <Content>
      <ContentHeader title={scorecard.name}>
        <CardActions>
          <CopyCsvButton entitiesByTag={entitiesByTag} scores={scores} />
        </CardActions>
      </ContentHeader>
      <Grid container direction="row" alignItems={'flex-end'} spacing={2}>
        <Grid item lg={4}>
          <ScorecardMetadataCard scorecard={scorecard} scores={scores} />
        </Grid>
        <Grid item lg={8} xs={12}>
          <ScorecardStatsCard scores={filteredScores} ladder={ladder} />
        </Grid>
      </Grid>
      <Grid container justifyContent={'space-between'}>
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          aria-label="Tabs for scorcard"
        >
          <Tab
            label={ScorecardDetailsTab.Scores.label}
            value={ScorecardDetailsTab.Scores}
          />
          <Tab
            label={ScorecardDetailsTab.Rules.label}
            value={ScorecardDetailsTab.Rules}
          />
          <Tab
            label={ScorecardDetailsTab.Reports.label}
            value={ScorecardDetailsTab.Reports}
          />
          <Tab
            label={ScorecardDetailsTab.Exemptions.label}
            value={ScorecardDetailsTab.Exemptions}
          />
        </Tabs>
        <ButtonGroup>
          <Button onClick={() => setFilterDialogOpen(true)}>TEST</Button>
        </ButtonGroup>
      </Grid>
      <Grid container lg={12}>
        {activeTab.render({
          scorecard: scorecard,
          ladder: ladder,
          entitiesByTag: entitiesByTag,
          scores: filteredScores,
        })}
      </Grid>
      {isFilterDialogOpen && (
        <ScorecardFilterDialog
          isOpen={isFilterDialogOpen}
          handleClose={handleFilterDialogClose}
          scorecard={scorecard}
          filters={filter}
          setFilter={setFilter}
        />
      )}{' '}
    </Content>
  );
};
