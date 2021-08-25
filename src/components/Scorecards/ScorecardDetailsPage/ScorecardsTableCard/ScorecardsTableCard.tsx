import { InfoCard } from "@backstage/core";
import React from "react";
import { ScorecardServiceScore } from "../../../../api/types";
import { useScorecardDetailCardStyles } from "../../../../styles/styles";
import { Table } from "@material-ui/core";
import { ScorecardsTableRow } from "./ScorecardsTableRow";

interface ScorecardsTableProps {
  scores: ScorecardServiceScore[]
}

export const ScorecardsTableCard = ({
  scores
}: ScorecardsTableProps) => {

  const classes = useScorecardDetailCardStyles()

  return (
    <InfoCard title="Scores" className={classes.root}>
      <Table>
        { scores.map(score => (
          <ScorecardsTableRow key={score.serviceId} score={score}/>
        ))}
      </Table>
    </InfoCard>
  )
}
