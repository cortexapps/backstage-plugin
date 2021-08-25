import React from "react";
import { Scorecard, ScorecardServiceScore } from "../../../../api/types";
import { Chip, Grid } from "@material-ui/core";
import { ScorecardMetadataItem } from "./ScorecardMetadataItem";
import moment from "moment";
import { InfoCard } from "@backstage/core-components";
import { useScorecardDetailCardStyles } from "../../../../styles/styles";

interface ScorecardMetadataCardProps {
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
}

export const ScorecardMetadataCard = ({
  scorecard,
  scores,
}: ScorecardMetadataCardProps) => {

  const classes = useScorecardDetailCardStyles()

  const lastUpdated = scores.length === 0 ? undefined : moment.max(scores.map(score => moment.utc(score.lastUpdated).local()))
  const nextUpdated = scorecard.nextUpdated ? moment.utc(scorecard.nextUpdated) : undefined

  return (
    <InfoCard title="Details" className={classes.root}>
      <Grid container>
        { scorecard.description && (
          <ScorecardMetadataItem gridSizes={{ xs: 12 }} label="Description">
            { scorecard.description }
          </ScorecardMetadataItem>
        )}
        <ScorecardMetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Owner">
          {scorecard.creator.name}
        </ScorecardMetadataItem>
        { scorecard.serviceGroups.length > 0 && (
          <ScorecardMetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Applies To">
            {scorecard.serviceGroups.map(s => (
              <Chip key={s.id} size="small" label={s.tag} />
            ))}
          </ScorecardMetadataItem>
        )}
        { lastUpdated && (
          <ScorecardMetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Last Updated">
            { lastUpdated.fromNow() }
          </ScorecardMetadataItem>
        )}
        { nextUpdated && (
          <ScorecardMetadataItem gridSizes={{ xs: 12, sm: 6, lg: 4 }} label="Next Evaluation">
            { nextUpdated.fromNow() }
          </ScorecardMetadataItem>
        )}
      </Grid>
    </InfoCard>
  )
}
