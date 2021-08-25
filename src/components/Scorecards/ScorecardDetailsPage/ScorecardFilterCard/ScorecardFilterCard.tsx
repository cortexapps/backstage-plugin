import React, { useState } from "react";
import { ruleName, Scorecard, ScorecardServiceScore } from "../../../../api/types";
import { InfoCard } from "@backstage/core-components";
import { ScorecardFilters } from "./ScorecardFilters";
import { useScorecardDetailCardStyles } from "../../../../styles/styles";
import { ScorecardServiceScoreFilter } from "../ScorecardDetails";

interface ScorecardRulesCardProps {
  scorecard: Scorecard;
  setFilter: (filter: ScorecardServiceScoreFilter) => void
}

enum FilterType {
  FAILING_RULE = 'FAILING_RULE',
  PASSING_RULE = 'PASSING_RULE',
  SERVICE_GROUP = 'SERVICE_GROUP',
}

export const ScorecardFilterCard = ({
  scorecard,
  setFilter,
}: ScorecardRulesCardProps) => {

  const classes = useScorecardDetailCardStyles()

  const [allFilters, setAllFilters] = useState<Partial<Record<FilterType, ScorecardServiceScoreFilter>>>({})

  const setFilterType = (type: FilterType, predicate: ScorecardServiceScoreFilter) => {
    const newFilters = {
      ...allFilters,
      [type]: predicate
    }
    setAllFilters(newFilters)
    const combinedPredicate = (score: ScorecardServiceScore) => {
      return Object
        .values(newFilters)
        .map(filter => filter?.(score) ?? true)
        .every(Boolean)
    }

    setFilter(combinedPredicate)
  }

  const createRulePredicate = (pass: boolean, ruleExpressions: string[], oneOf: boolean) => {
    return (score: ScorecardServiceScore) => {
      const results = score
        .rules
        .filter(rule => ruleExpressions.includes(rule.rule.expression))
        .map(rule => (rule.score > 0) === pass)

      if (results.length === 0) return true
      return oneOf ? results.some(Boolean) : results.every(Boolean)
    }
  }

  return (
    <InfoCard title="Filter By" className={classes.root}>
      <ScorecardFilters
        name="Failing Rule:"
        filters={scorecard.rules.map(rule => {
          return {
            id: rule.expression,
            display: ruleName(rule)
          }
        })}
        setFilters={(filters, oneOf) => {
          setFilterType(FilterType.FAILING_RULE, createRulePredicate(false, filters, oneOf))
        }}
      />
      <ScorecardFilters
        name="Passing Rule:"
        filters={scorecard.rules.map(rule => {
          return {
            id: rule.expression,
            display: ruleName(rule)
          }
        })}
        setFilters={(filters, oneOf) => {
          setFilterType(FilterType.FAILING_RULE, createRulePredicate(true, filters, oneOf))
        }}
      />
    </InfoCard>
  )
}
