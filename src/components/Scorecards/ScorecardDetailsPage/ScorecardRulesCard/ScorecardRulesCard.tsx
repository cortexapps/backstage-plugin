import React from "react";
import { Rule, Scorecard } from "../../../../api/types";
import { Grid, Typography } from "@material-ui/core";
import { InfoCard } from "@backstage/core-components";
import { useScorecardDetailCardStyles } from "../../../../styles/styles";

interface ScorecardRulesCardProps {
  scorecard: Scorecard;
}

const ScorecardRulesRow = ({
  rule
}: { rule: Rule }) => {

  const classes = useScorecardDetailCardStyles()

  return (
    <React.Fragment>
      <Grid item lg={10}>
        <Typography variant="subtitle1" className={classes.rule}>
          { rule.title ?? rule.expression }
        </Typography>
        { rule.description && (
          <i>{ rule.description }</i>
        )}
      </Grid>
      <Grid item lg={2}>
        <b>{ rule.weight }</b>
      </Grid>
    </React.Fragment>
  )
}

export const ScorecardRulesCard = ({
  scorecard,
}: ScorecardRulesCardProps) => {

  const classes = useScorecardDetailCardStyles()

  return (
    <InfoCard title="Rules" className={classes.root}>
      <Grid container>
        { scorecard.rules.map(rule =>
          <ScorecardRulesRow key={rule.id} rule={rule}/>
        )}
      </Grid>
    </InfoCard>
  )
}
