import { Content, ContentHeader, } from '@backstage/core-components';
import React, { useMemo, useState } from "react";
import { Scorecard, ScorecardServiceScore } from "../../../api/types";
import { Grid } from "@material-ui/core";
import { ScorecardMetadataCard } from "./ScorecardMetadataCard";
import { ScorecardRulesCard } from "./ScorecardRulesCard";
import { ScorecardFilterCard } from "./ScorecardFilterCard";
import { ScorecardsTableCard } from "./ScorecardsTableCard";

export type ScorecardServiceScoreFilter = (score: ScorecardServiceScore) => boolean

interface ScorecardDetailsProps {
  scorecard: Scorecard,
  scores: ScorecardServiceScore[],
}

export const ScorecardDetails = ({
  scorecard,
  scores
}: ScorecardDetailsProps) => {

  // Have to store lambda of lambda for React to not eagerly invoke
  const [filter, setFilter] = useState<() => (ScorecardServiceScoreFilter)>(
    () => () => true
  )

  const filteredScores = useMemo(() => {
    return scores.filter(filter)
  }, [scores, filter])

  return (
    <Content>
      <ContentHeader title={scorecard.name}/>
      <Grid container direction="row" spacing={2}>
        <Grid item lg={4}>
          <ScorecardMetadataCard scorecard={scorecard} scores={scores}/>
          <ScorecardRulesCard scorecard={scorecard}/>
          <ScorecardFilterCard
            scorecard={scorecard}
            setFilter={(newFilter) => setFilter(() => newFilter)}
          />
        </Grid>
        <Grid item lg={8} xs={12}>
          <ScorecardsTableCard scores={filteredScores}/>
        </Grid>
      </Grid>
    </Content>
  )
}
