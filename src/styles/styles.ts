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
