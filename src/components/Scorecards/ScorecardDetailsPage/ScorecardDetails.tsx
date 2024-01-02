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
import { Content } from '@backstage/core-components';
import React, { useMemo, useState } from 'react';
import {
  Scorecard,
  ScorecardLadder,
  ScorecardRuleExemptionResult,
  ScorecardServiceScore,
} from '../../../api/types';
import { Box, Button, Grid, Tab, Tabs } from '@material-ui/core';
import { ScorecardMetadataCard } from './ScorecardMetadataCard';
import {
  ScorecardLadderRulesCard,
  ScorecardScoresRulesCard,
} from './ScorecardRulesTab';
import { Predicate } from '../../../utils/types';
import {
  ScorecardLadderStatsCard,
  ScorecardScoresStatsCard,
} from './ScorecardStatsCard';
import { StringIndexable } from '../../ReportsPage/HeatmapPage/HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import CopyCsvButton from './CopyCsvButton';
import { ScorecardReportsTab } from './ScorecardReportsTab';
import { ScorecardFilterDialog } from './ScorecardFilterDialog';
import { getEntityCategoryFromFilter } from './ScorecardMetadataCard/ScorecardMetadataUtils';
import { ScorecardRuleExemptionsTab } from './ScorecardRuleExemptionsTab';
import { ScorecardsScoresTable } from './ScorecardsScoresTab';

export type ScorecardServiceScoreFilter = Predicate<ScorecardServiceScore>;

interface ScorecardDetailsProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  ladder?: ScorecardLadder;
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
  ruleExemptions: ScorecardRuleExemptionResult['scorecardRuleExemptions'];
}

enum ScorecardDetailsTab {
  'Scores' = 'Scores',
  'Rules' = 'Rules',
  'Reports' = 'Reports',
  'RuleExemptions' = 'Rule Exemptions',
}

export const ScorecardDetails = ({
  entitiesByTag,
  ladder,
  scorecard,
  scores,
  ruleExemptions,
}: ScorecardDetailsProps) => {
  const [activeTab, setActiveTab] = useState(ScorecardDetailsTab.Scores);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const entityCategory = getEntityCategoryFromFilter(scorecard.filter);

  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => ScorecardServiceScoreFilter>(
    () => () => true,
  );

  const filteredScores = useMemo(() => {
    return scores.filter(filter);
  }, [scores, filter]);

  const handleTabChange = (
    _event: React.ChangeEvent<{}>,
    newValue: ScorecardDetailsTab,
  ) => {
    setActiveTab(newValue);
  };

  const renderTab = (tabName: ScorecardDetailsTab) => {
    switch (tabName) {
      case ScorecardDetailsTab.Scores:
        return (
          <ScorecardsScoresTable
            category={entityCategory}
            entitiesByTag={entitiesByTag}
            scorecardId={scorecard.id}
            scores={filteredScores}
            ladder={ladder}
          />
        );
      case ScorecardDetailsTab.Rules:
        return ladder ? (
          <ScorecardLadderRulesCard ladder={ladder} />
        ) : (
          <ScorecardScoresRulesCard scorecard={scorecard} />
        );
      case ScorecardDetailsTab.Reports:
        return <ScorecardReportsTab scorecard={scorecard} />;
      case ScorecardDetailsTab.RuleExemptions:
        return (
          <ScorecardRuleExemptionsTab
            entitiesByTag={entitiesByTag}
            ruleExemptions={ruleExemptions}
            scorecard={scorecard}
            scores={scores}
          />
        );
    }
  };

  const handleFilterDialogClose = () => {
    setIsFilterDialogOpen(false);
  };

  return (
    <Content>
      <Grid container direction="row" spacing={1}>
        <Grid item lg={5} xs={12}>
          <ScorecardMetadataCard scorecard={scorecard} scores={scores} />
        </Grid>
        <Grid item lg={7} xs={12}>
          <Box display="flex" flexDirection="column">
            {ladder ? (
              <ScorecardLadderStatsCard
                entityCategory={entityCategory}
                scores={filteredScores}
                scorecardLadder={ladder}
              />
            ) : (
              <ScorecardScoresStatsCard
                scores={filteredScores}
                entityCategory={entityCategory}
              />
            )}
          </Box>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
        >
          <Tab
            label={ScorecardDetailsTab.Scores}
            value={ScorecardDetailsTab.Scores}
          />
          <Tab
            label={ScorecardDetailsTab.Rules}
            value={ScorecardDetailsTab.Rules}
          />
          <Tab
            label={ScorecardDetailsTab.Reports}
            value={ScorecardDetailsTab.Reports}
          />
          <Tab
            label={ScorecardDetailsTab.RuleExemptions}
            value={ScorecardDetailsTab.RuleExemptions}
          />
        </Tabs>
        {activeTab === ScorecardDetailsTab.Scores && (
          <Box display="flex" flexDirection="row" gridGap={8}>
            <Button
              onClick={() => setIsFilterDialogOpen(true)}
              variant="outlined"
              aria-label="Filter"
            >
              filter
            </Button>
            <CopyCsvButton entitiesByTag={entitiesByTag} scores={scores} />
          </Box>
        )}
      </Box>
      <Box my={1}>{renderTab(activeTab)}</Box>
      <ScorecardFilterDialog
        isOpen={isFilterDialogOpen}
        handleClose={handleFilterDialogClose}
        scorecard={scorecard}
        setFilter={(filter: any) => setFilter(() => filter)}
        ladder={ladder}
      />
    </Content>
  );
};
