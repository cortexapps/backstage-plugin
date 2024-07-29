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
import React, {
  useCallback,
  useState,
} from 'react';
import {
  ContentHeader,
  Progress,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
// import { SingleScorecardHeatmap } from './SingleScorecardHeatmap';
import { ScorecardSelector } from '../ScorecardSelector';
import { useCortexApi } from '../../../utils/hooks';
// import { FilterType, GroupByOption, HeaderType } from '../../../api/types';
import { CopyButton } from '../../Common/CopyButton';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { isFunction } from 'lodash';
import { stringifyUrl } from 'query-string';
// import { defaultFilters as defaultScoreFilters } from './HeatmapFiltersModal';
// import { HeatmapFilters, HeatmapPageFilters, SortBy } from './HeatmapFilters';
import {
  Filters,
  defaultInitial,
} from "@cortexapps/birdseye";
import { HeatmapTable } from './HeatmapTable';

// const defaultFilters: HeatmapPageFilters = {
//   groupBy: GroupByOption.ENTITY,
//   headerType: HeaderType.RULES,
//   scoreFilters: defaultScoreFilters,
//   useHierarchy: false,
//   hideWithoutChildren: true,
// };

// const MISC_ELEMENT_PADDING = 48;
// const BREADCRUMB_HEIGHT = 38;
// const getTableHeight = ({
//   element,
//   includeBreadcrumb,
// }: {
//   element: HTMLDivElement;
//   includeBreadcrumb: boolean;
// }) => {
//   return (
//     window.innerHeight -
//     element.clientHeight -
//     element.offsetTop -
//     MISC_ELEMENT_PADDING -
//     (includeBreadcrumb ? BREADCRUMB_HEIGHT : 0)
//   );
// };

export const HeatmapPage = () => {
  // const [filters, setFilters] = useState<Filters>(defaultInitial);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  // const filterRef = useRef<HTMLDivElement>(null);
  // const [tableHeight, setTableHeight] = useState<number>(0);

  // const alertApi = useApi(alertApiRef);

  const filtersToParams = (filters: Filters) => {
    return {
      scorecardId: filters.scorecardId,
      // groupBy:
      //   filters.groupBy !== defaultFilters.groupBy
      //     ? (filters.groupBy as string)
      //     : undefined,
      // hierarchyGroupBy: !!filters.hierarchyGroupBy
      //   ? (filters.hierarchyGroupBy as string)
      //   : undefined,
      // headerType:
      //   filters.headerType !== defaultFilters.headerType
      //     ? (filters.headerType as string)
      //     : undefined,
      // serviceIds: filters.scoreFilters.serviceIds.length
      //   ? filters.scoreFilters.serviceIds
      //   : undefined,
      // groups: filters.scoreFilters.groups.length
      //   ? filters.scoreFilters.groups
      //   : undefined,
      // teams: filters.scoreFilters.teams.length
      //   ? filters.scoreFilters.teams
      //   : undefined,
      // users: filters.scoreFilters.users.length
      //   ? filters.scoreFilters.users
      //   : undefined,
      // domainIds: filters.scoreFilters.domainIds.length
      //   ? filters.scoreFilters.domainIds
      //   : undefined,
      // levels: filters.scoreFilters.levels.length
      //   ? filters.scoreFilters.levels
      //   : undefined,
      // hierarchy: filters.useHierarchy ? 'true' : undefined,
      // hideWithoutChildren: !filters.hideWithoutChildren ? 'false' : undefined,
      // path: filters.path,
      // selectedGroupBy: filters.selectedGroupBy,
    };
  };

  // const queryScorecardId = Number(searchParams.get('scorecardId') ?? undefined);
  // const initialScorecardId = Number.isNaN(queryScorecardId)
  //   ? undefined
  //   : queryScorecardId;

  const [filters, setFilters] = useState<Filters>({
    ...defaultInitial,
    scorecardId: searchParams.get('scorecardId') ?? undefined,
    // groupBy:
    //   (searchParams.get('groupBy') as GroupByOption) ?? defaultFilters.groupBy,
    // hierarchyGroupBy:
    //   (searchParams.get('hierarchyGroupBy') as GroupByOption) ?? undefined,
    // headerType:
    //   (searchParams.get('headerType') as HeaderType) ??
    //   defaultFilters.headerType,
    // useHierarchy: !!searchParams.has('hierarchy'),
    // hideWithoutChildren: !searchParams.has('hideWithoutChildren'),
    // scoreFilters: {
    //   serviceIds:
    //     searchParams
    //       .getAll('serviceIds')
    //       .map(i => parseInt(i, 10))
    //       .filter(isFinite) ?? defaultFilters.scoreFilters.serviceIds,
    //   groups:
    //     searchParams.getAll('groups') ?? defaultFilters.scoreFilters.groups,
    //   teams: searchParams.getAll('teams') ?? defaultFilters.scoreFilters.teams,
    //   users: searchParams.getAll('users') ?? defaultFilters.scoreFilters.users,
    //   domainIds:
    //     searchParams
    //       .getAll('domainIds')
    //       .map(i => parseInt(i, 10))
    //       .filter(isFinite) ?? defaultFilters.scoreFilters.domainIds,
    //   levels:
    //     searchParams.getAll('levels') ?? defaultFilters.scoreFilters.levels,
    // },
    // path: searchParams.getAll('path'),
    // selectedGroupBy: searchParams.getAll('selectedGroupBy') as
    //   | [GroupByOption, string]
    //   | undefined,
  });
  const setFiltersAndNavigate = useCallback(
    (value: React.SetStateAction<Filters>) =>
      setFilters(prev => {
        const newFilters = isFunction(value) ? value(prev) : value;

        navigate(
          stringifyUrl({
            url: location.pathname,
            query: filtersToParams(newFilters),
          }),
          { replace: true },
        );

        return newFilters;
      }),
    [location.pathname, navigate],
  );

  // const { value: ladders, loading: loadingLadders } = useCortexApi(
  //   async api =>
  //     filters.selectedScorecardId
  //       ? api.getScorecardLadders(filters.selectedScorecardId)
  //       : undefined,
  //   [filters.selectedScorecardId],
  // );

  // const getShareableLink = useCallback(() => {
  //   return buildUrl(filtersToParams(filters), location.pathname);
  // }, [filters, location]);
  // const onGetShareableLinkSuccess = () =>
  //   alertApi.post({ message: 'Share link copied!', display: 'transient' });

  const scorecardsResult = useCortexApi(api => api.getScorecards());
  const { loading: isLoadingScorecards } = scorecardsResult;
  const { value: scores, loading: isLoadingScores } = useCortexApi(
    async api =>
      filters.scorecardId
        ? api.getScorecardScores(Number.parseInt(filters.scorecardId))
        : undefined,
    [filters.scorecardId],
  );
  const { value: ladders, loading: isLoadingLadder } = useCortexApi(
    async api =>
      filters.scorecardId
        ? api.getScorecardLadders(Number.parseInt(filters.scorecardId))
        : undefined,
    [filters.scorecardId],
  );
  const { value: catalog, loading: isLoadingCatalog } = useCortexApi(api => api.getCatalogEntities());
  const { value: domainHierarchies, loading: isLoadingDomainHierarchies } = useCortexApi(api => api.getDomainHierarchies());
  const isLoading = isLoadingScorecards || isLoadingScores || isLoadingCatalog || isLoadingLadder || isLoadingDomainHierarchies;

  // const { entityCategory, excludedGroupBys } = useMemo(() => {
  //   const selectedScorecard = scorecardsResult.value?.find(
  //     scorecard => scorecard.id === filters.selectedScorecardId,
  //   );

  //   const excludedGroupBys = isScorecardTeamBased(selectedScorecard)
  //     ? [GroupByOption.TEAM]
  //     : [];
  //   if (selectedScorecard?.filter?.type === FilterType.DOMAIN_FILTER)
  //     excludedGroupBys.push(GroupByOption.DOMAIN);
  //   if (isEmpty(ladders)) excludedGroupBys.push(GroupByOption.LEVEL);

  //   if (filters.groupBy && excludedGroupBys.includes(filters.groupBy)) {
  //     setFiltersAndNavigate(prev => ({
  //       ...prev,
  //       groupBy: defaultFilters.groupBy,
  //     }));
  //   }

  //   return {
  //     entityCategory:
  //       getEntityCategoryFromFilter(selectedScorecard?.filter) ?? 'Entity',
  //     excludedGroupBys,
  //   };
  // }, [filters, setFiltersAndNavigate, scorecardsResult, ladders]);

  const onScorecardSelectChange = (scorecardId?: number) => {
    setFiltersAndNavigate({ ...defaultInitial, scorecardId: scorecardId?.toString() });
  };

  // const { entitiesByTag, loading: loadingEntities } = useEntitiesByTag();

  // useEffect(() => {
  //   // Measure once we have all elements on the page so we can calculate the table height
  //   if (
  //     filterRef.current &&
  //     !scorecardsResult.loading &&
  //     filters.selectedScorecardId
  //   ) {
  //     setTableHeight(
  //       getTableHeight({
  //         element: filterRef.current,
  //         includeBreadcrumb: filters.useHierarchy || !!filters.selectedGroupBy,
  //       }),
  //     );
  //   }
  // }, [
  //   scorecardsResult.loading,
  //   filters.selectedScorecardId,
  //   filters.groupBy,
  //   filters.useHierarchy,
  //   filters.selectedGroupBy,
  // ]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (filterRef.current) {
  //       setTableHeight(
  //         getTableHeight({
  //           element: filterRef.current,
  //           includeBreadcrumb:
  //             filters.useHierarchy || !!filters.selectedGroupBy,
  //         }),
  //       );
  //     }
  //   };
  //   const handleResizeDebounced = debounce(handleResize, 150);

  //   window.addEventListener('resize', handleResizeDebounced);
  //   handleResize();
  //   return () => window.removeEventListener('resize', handleResizeDebounced);
  // }, [filters.useHierarchy, filters.selectedGroupBy]);

  const scorecard = scorecardsResult.value?.find((result => result.id.toString() === filters.scorecardId));

  return (
    <>
      <ContentHeader title="Bird's Eye">
        <CopyButton
          textToCopy={() => '' /* TODO */}
          aria-label="Share link"
          onSuccess={() => {} /* TODO */}
        >
          Share link
        </CopyButton>
      </ContentHeader>
      <Grid container direction="column">
        <Grid item lg={12}>
          {/* TODO: Controlled / uncontrolled state */}
          <ScorecardSelector
            selectedScorecardId={filters.scorecardId ? Number.parseInt(filters.scorecardId) : undefined}
            onSelect={onScorecardSelectChange}
            scorecardsResult={scorecardsResult}
          />
        </Grid>
        {/* <Grid item style={{ marginTop: '20px' }} ref={filterRef}>
          <HeatmapFilters
            filters={filters}
            setSortBy={setSortBy}
            setFiltersAndNavigate={setFiltersAndNavigate}
            excludedGroupBys={excludedGroupBys}
            entitiesByTag={entitiesByTag}
            ladder={ladders?.[0]}
          />
        </Grid> */}
        <Grid item lg={12}>
          {isLoading ? (
            <Progress />
          ) : (
            scorecard && (
              <HeatmapTable
                allDomains={[
                  {
                    "id": '36',
                    "cid": "en2e8a42777d161c82",
                    "codeTag": "examples",
                    "name": "Examples",
                    "type": "domain" as any,
                    "description": undefined,
                    "icon": {
                      "kind": "cortex",
                      "tag": "domain",
                      "url": "http://api.local.getcortexapp.com:8080/api/internal/v1/static?type=FS&kind=cortex&path=domain"
                    },
                    "serviceOwnerEmails": [],
                    "groupNames": [
                      "guests"
                    ],
                    "serviceGroupTags": [],
                    "isArchived": false
                  }
                ]}
                allTeams={[
                  {
                    "id": '30',
                    "cid": "en2e8a4277c0bced85",
                    "identifier": {
                      "name": "Guests",
                      "teamTag": "guests",
                      "ownerGroup": "guests",
                      "ownerProviderType": "CORTEX_TEAMS" as any
                    },
                    "shortDescription": undefined,
                    "fullDescription": undefined,
                    "links": [],
                    "slackChannels": [],
                    "numTeamMembers": 0,
                    "isArchived": false
                  }
                ]}
                catalog={catalog?.entities ?? []}
                domainAncestryMap={{}}
                domainHierarchy={domainHierarchies}
                filters={filters}
                ladder={ladders?.[0]}
                scorecard={scorecard}
                scores={scores ?? []}
                setFilters={setFilters}
                teamsByEntity={{
                  "28": [],
                  "29": [],
                  "30": [],
                  "31": [],
                  "32": [],
                  "33": [],
                  "34": [],
                  "35": [],
                  "36": []
                }}
              />
            )
          )}
        </Grid>
      </Grid>
    </>
  );
};
