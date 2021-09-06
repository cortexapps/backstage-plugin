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
import React, { useState } from "react";
import { Checkbox, Grid, makeStyles, MenuItem, Typography } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import { fallbackPalette } from "../../../../styles/styles";

const useStyles = makeStyles(theme => ({
  name: {
    color: theme.palette?.text?.secondary ?? fallbackPalette.text.secondary,
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  select: {
    color: theme.palette?.text?.secondary ?? fallbackPalette.text.secondary,
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
