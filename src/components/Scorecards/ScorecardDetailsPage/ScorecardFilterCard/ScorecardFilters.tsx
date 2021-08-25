import React, { useState } from "react";
import { Checkbox, Grid, makeStyles, MenuItem, Typography } from "@material-ui/core";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles(theme => ({
  name: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  select: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
  }
}))

interface ScorecardFiltersProps {
  name: string;
  filters: {id: string, display: string}[];
  setFilters: (filters: string[], oneOf: boolean) => void;
}

export const ScorecardFilters = ({
  name,
  filters,
  setFilters
}: ScorecardFiltersProps) => {

  const classes = useStyles()

  const [oneOf, setOneOf] = useState(true)
  const [checkedFilters, setCheckedFilters] = useState<Record<string, boolean>>({})

  const toggleFilter = (filter: string) => {
    setCheckedFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [filter]: !(prevFilters[filter] ?? false)
      }

      setFilters(
        Object.keys(newFilters).filter(f => newFilters[f]),
        oneOf
      )

      return newFilters
    })
  }

  const toggleOneOf = () => {
    setOneOf((prevOneOf) => {
      setFilters(
        Object.keys(checkedFilters).filter(f => checkedFilters[f]),
        !prevOneOf
      )
      return !prevOneOf
    })
  }

  return (
    <Grid container spacing={2} justify="center" alignItems="center">
      <Grid item lg={10}>
        <Typography variant="subtitle2" className={classes.name}>
          { name }
        </Typography>
      </Grid>
      <Grid item lg={2}>
        <Select
          value={oneOf ? 'One Of' : 'All Of'}
          onChange={() => toggleOneOf()}
          className={classes.select}
        >
          <MenuItem value="One Of">One Of</MenuItem>
          <MenuItem value="All Of">All Of</MenuItem>
        </Select>
      </Grid>
      { filters.map(filter => (
        <React.Fragment key={`${name}-${filter.id}`}>
          <Grid item lg={2}>
            <Checkbox
              checked={checkedFilters[filter.id] ?? false}
              onChange={() => toggleFilter(filter.id)}
              color="primary"
            />
          </Grid>
          <Grid item lg={10}>
            <span>{ filter.display }</span>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  )
}
