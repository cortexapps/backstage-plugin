/*
 * Copyright 2024 Cortex Applications, Inc.
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
import React, { useCallback, useMemo } from 'react';
import { EmptyState } from '@backstage/core-components';
import {
  useCortexBirdseye,
  BirdsEyeReportTable,
  TeamResponse,
  Domain,
  StringIndexable,
  TeamDetails,
  Filters,
  BirdsEyeReportTableProps,
} from '@cortexapps/birdseye';
import {
  DomainHierarchiesResponse,
  Scorecard,
  ScorecardLadder,
  ScorecardServiceScore,
  TeamHierarchiesResponse,
} from '../../../api/types';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { mapKeys, mapValues } from 'lodash';
import { HeatmapSettings } from './HeatmapSettings';
import { useColorCellStyles } from './colorClasses';
import { Grid } from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { scorecardServiceDetailsRouteRef } from '../../../routes';
import {
  defaultComponentRefContext,
  entityComponentRef,
} from '../../../utils/ComponentUtils';
import { parseEntityRef } from '@backstage/catalog-model';
import {
  BirdsEyeAnchorAdapter,
  convertToBirdsEyeDomainHierarchy,
  convertToBirdsEyeScorecard,
  convertToBirdsEyeScores,
  convertToBirdsEyeTeamHierarchy,
  getCellColorBackground,
  getScoreColorClassName,
  useTableStyles,
} from './HeatmapUtils';

interface HeatmapTableProps {
  allDomains: Domain[];
  allTeams: TeamResponse[];
  catalog: HomepageEntity[];
  domainHierarchy: DomainHierarchiesResponse | undefined;
  domainAncestryMap: Record<number, number[]>;
  entitiesByTag: StringIndexable<HomepageEntity>;
  filters: Filters;
  ladder?: ScorecardLadder;
  scorecard: Scorecard;
  scores: ScorecardServiceScore[];
  setFilters: (filters: Filters) => void;
  teamHierarchy?: TeamHierarchiesResponse;
  teamsByEntity: StringIndexable<TeamDetails[]> | undefined;
}

export const HeatmapTable: React.FC<HeatmapTableProps> = ({
  allDomains,
  allTeams,
  catalog,
  domainAncestryMap,
  domainHierarchy,
  entitiesByTag,
  filters,
  ladder,
  scorecard,
  scores,
  setFilters,
  teamsByEntity,
  teamHierarchy,
}) => {
  const colorStyles = useColorCellStyles();
  const styles = useTableStyles();

  const {
    mappedDomainAncestryMap,
    mappedDomainHierarchies,
    mappedScorecard,
    mappedScores,
    mappedTeamHierarchies,
  } = useMemo(() => {
    const mappedScorecard = convertToBirdsEyeScorecard(scorecard, ladder);
    const mappedScores = convertToBirdsEyeScores(scores, catalog);
    const mappedDomainHierarchies =
      convertToBirdsEyeDomainHierarchy(domainHierarchy);
    const mappedTeamHierarchies = convertToBirdsEyeTeamHierarchy(teamHierarchy);
    const mappedDomainAncestryMapKeys = mapKeys(domainAncestryMap, (_, key) =>
      key.toString(),
    );
    const mappedDomainAncestryMap = mapValues(
      mappedDomainAncestryMapKeys,
      values => values.map(value => value.toString()),
    );

    return {
      mappedScorecard,
      mappedScores,
      mappedDomainHierarchies,
      mappedDomainAncestryMap,
      mappedTeamHierarchies,
    };
  }, [catalog, domainAncestryMap, domainHierarchy, ladder, scorecard, scores, teamHierarchy]);

  const {
    tableData,
    setDataFilters,
    groupByOptions,
    setReportType,
    filtersConfig,
    setHideTeamsWithoutEntities,
    setGroupBy,
    setUseHierarchy,
    showHierarchy,
    groupBy,
    shouldShowReportType,
  } = useCortexBirdseye({
    allDomains,
    allTeams,
    domainAncestryMap: mappedDomainAncestryMap,
    domainHierarchy: mappedDomainHierarchies,

    filters,
    scorecard: mappedScorecard,
    scores: mappedScores,
    setFilters,
    teamHierarchy: mappedTeamHierarchies,
    teamsByEntity,
  });

  const scorecardServiceDetailsRef = useRouteRef(
    scorecardServiceDetailsRouteRef,
  );

  const cellColorClassNameHandler = useCallback(
    (points: number) => {
      return `${colorStyles.root} ${
        colorStyles[getCellColorBackground(points)]
      }`;
    },
    [colorStyles],
  );

  const scoreColorClassNameHandler = useCallback(
    (points: number) => {
      return `${colorStyles.root} ${
        colorStyles[getScoreColorClassName(points)]
      }`;
    },
    [colorStyles],
  );

  const scorecardEntityUrlHandler = useCallback(
    (
      scorecardEntity: Parameters<
        BirdsEyeReportTableProps['getScorecardEntityUrl']
      >[0],
    ) => {
      const entityId = Number.parseInt(scorecardEntity.entityId);
      const entity = catalog.find(entity => entityId === entity.id);
      const codeTag = entity?.codeTag;
      if (!codeTag) {
        return '';
      }

      const componentRef = entityComponentRef(entitiesByTag, codeTag);

      const entityName = parseEntityRef(
        componentRef,
        defaultComponentRefContext,
      );

      const entityUrl = scorecardServiceDetailsRef({
        scorecardId: `${mappedScorecard.id}`,
        ...entityName,
      });

      return entityUrl;
    },
    [catalog, entitiesByTag, mappedScorecard.id, scorecardServiceDetailsRef],
  );

  return (
    <Grid container direction={'column'}>
      <Grid item style={{ marginTop: '20px' }}>
        <HeatmapSettings
          filters={filters}
          groupByOptions={groupByOptions}
          setGroupBy={setGroupBy}
          filtersConfig={filtersConfig}
          groupBy={groupBy}
          setDataFilters={setDataFilters}
          setHideTeamsWithoutEntities={setHideTeamsWithoutEntities}
          setReportType={setReportType}
          setUseHierarchy={setUseHierarchy}
          shouldShowReportType={shouldShowReportType}
          showHierarchy={showHierarchy}
        />
      </Grid>
      <Grid item>
        <BirdsEyeReportTable
          {...tableData}
          className={styles.table}
          components={{
            anchor: BirdsEyeAnchorAdapter,
          }}
          emptyResultDisplay={<EmptyState title="No data" missing="data" />}
          filters={filters}
          getCellColorClassName={cellColorClassNameHandler}
          getScoreColorClassName={scoreColorClassNameHandler}
          getScorecardEntityUrl={scorecardEntityUrlHandler}
          setFilters={setFilters}
        />
      </Grid>
    </Grid>
  );
};
