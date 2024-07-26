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
  EmptyState,
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
  useCortexBirdseye,
  BirdsEyeReportTable,
  Filters,
  defaultInitial,
} from "@cortexapps/birdseye";

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

  // const scorecard = scorecardsResult.value?.[0];
  
  const {
    tableData,
    // setDataFilters,
    // resetFilters,
    // groupByOptions,
    // setReportType,
    // filtersConfig,
    // entityCategory,
    // setHideTeamsWithoutEntities,
    // filtersAppliedCount,
    // setGroupBy,
    // setUseHierarchy,
    // showHierarchy,
    // groupBy,
    // shouldShowReportType,
    // breadcrumbItems,
    // onBreadcrumbClick,
  } = useCortexBirdseye({
    allDomains: [
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
    ],
    allTeams: [
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
    ],
    domainAncestryMap: {},
    domainHierarchy: {
      "orderedTree": [
        {
          "node": {
            "id": '36',
            "cid": "en2e8a42777d161c82",
            "tag": "examples",
            "name": "Examples",
            "type": "domain" as any,
            "description": undefined,
            "isArchived": false,
          },
          "orderedChildren": []
        }
      ]
    },
    filters,
    scorecard: {
      "creator": {
        "name": "Dusan Kovacik",
        "email": "dusan.kovacik@cortex.io",
      },
      "id": "14",
      "name": "Test 2",
      "tag": "test-2",
      "description": "This Scorecard is designed to ensure that your services are properly set up with the basics.\n\n(Created from Scorecard template)",
      "isDraft": false,
      "rules": [
        {
          "id": "42",
          "expression": "git != null",
          "weight": 5,
          "description": undefined,
          "title": "Has a git repository",
          "failureMessage": "You can add a git repository by following the instructions in our docs for [Azure DevOps](https://docs.cortex.io/docs/reference/integrations/azuredevops), [Bitbucket](https://docs.cortex.io/docs/reference/integrations/bitbucket), [GitHub](https://docs.cortex.io/docs/reference/integrations/github), or [GitLab](https://docs.cortex.io/docs/reference/integrations/gitlab) depending on the tool that your team uses.",
          "dateCreated": "2024-05-13T13:28:04.987922",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "335eeb5e-bea8-37e2-ab50-de28d956998b"
        },
        {
          "id": "43",
          "expression": "ownership.allOwners().length > 0",
          "weight": 5,
          "description": undefined,
          "title": "Has owners",
          "failureMessage": "You can add a owners by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/ownership).",
          "dateCreated": "2024-05-13T13:28:04.98799",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "92ab2234-ffb1-371b-9488-8ebe3485e503"
        },
        {
          "id": "44",
          "expression": "oncall != null",
          "weight": 2,
          "description": undefined,
          "title": "Has on-call rotation set up",
          "failureMessage": "You can add an on-call rotation by following the instructions in our docs for [Opsgenie](https://docs.cortex.io/docs/reference/integrations/opsgenie), [Pagerduty](https://docs.cortex.io/docs/reference/integrations/pagerduty), or [VictorOps](https://docs.cortex.io/docs/reference/integrations/victorops) depending on the tool that your team uses.",
          "dateCreated": "2024-05-13T13:28:04.988003",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "2a2e6d7e-9ea1-3df6-a2a1-8db501126d53"
        },
        {
          "id": "45",
          "expression": "slos().length > 0",
          "weight": 2,
          "description": undefined,
          "title": "Has SLOs set up",
          "failureMessage": "You can add SLOs by following the instructions in our docs for [Datadog](https://docs.cortex.io/docs/reference/integrations/datadog), [Lightstep](https://docs.cortex.io/docs/reference/integrations/lightstep), [Prometheus](https://docs.cortex.io/docs/reference/integrations/prometheus), or [SignalFX](https://docs.cortex.io/docs/reference/integrations/signalfx) depending on the tool that your team uses.",
          "dateCreated": "2024-05-13T13:28:04.988012",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "860ccd45-64b6-35c3-946b-8b3e961d6705"
        },
        {
          "id": "46",
          "expression": "entity.description() != null",
          "weight": 1,
          "description": undefined,
          "title": "Has description",
          "failureMessage": "You can add a description by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/entities).",
          "dateCreated": "2024-05-13T13:28:04.98803",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "945e4ff1-f775-3f3b-8b66-7199e1a595ab"
        },
        {
          "id": "47",
          "expression": "links(\"dashboards\").length > 0",
          "weight": 1,
          "description": undefined,
          "title": "Has at least one dashboard",
          "failureMessage": "You can add a link of type dashboard by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
          "dateCreated": "2024-05-13T13:28:04.988048",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "1574e553-c46a-3119-9a3a-68b5c0cd8d2d"
        },
        {
          "id": "48",
          "expression": "links(\"documentation\").length > 0",
          "weight": 1,
          "description": undefined,
          "title": "Has at least one link of type documentation",
          "failureMessage": "You can add a link of type documentation by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
          "dateCreated": "2024-05-13T13:28:04.988058",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "598a9e1f-0287-3c2c-86c9-d011c9672af1"
        },
        {
          "id": "49",
          "expression": "links(\"runbooks\").length > 0",
          "weight": 1,
          "description": undefined,
          "title": "Has at least one runbook",
          "failureMessage": "You can add a link of type runbook by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
          "dateCreated": "2024-05-13T13:28:04.988067",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "c2726668-13ec-33ba-8b24-ef8824ba72d4"
        },
        {
          "id": "50",
          "expression": "git.fileExists(\"README.md\")",
          "weight": 1,
          "description": undefined,
          "title": "Repository has a README.md file",
          "failureMessage": "Add a README.md file to the repository specified. If you don't have a repository specified, you can add one by following the instructions in our docs for [Azure DevOps](/admin/settings/azuredevops), [Bitbucket](/admin/settings/bitbucket), [GitHub](/admin/settings/github), or [GitLab](/admin/settings/gitlab) depending on the tool that your team uses.\n\nIf you already have a README.md file, keep in mind that this rule is case sensitive. To change this, you can update it to be something like \"git.fileExists(\"README.md\") or git.fileExists(\"readme.md\")\".",
          "dateCreated": "2024-05-13T13:28:04.988076",
          "filter": null,
          "cqlVersion": "2.0",
          "effectiveFrom": null,
          "identifier": "7ea7acc8-b314-344c-b23c-ba4bb95ca6ef"
        }
      ],
      "filter": {
        "type": "SERVICE_FILTER" as any
      },
      "evaluationWindow": null,
      "notifications": {
        "enabled": true
      },
      "exemptions": {
        "enabled": true,
        "autoApprove": false
      },
      "nextUpdated": "2024-07-25T11:11:00.089804",
      "ladder": {
        "scorecardId": "14",
        "levels": [
          {
            "id": "7",
            "name": "Bronze",
            "color": "#c38b5f",
            "description": undefined,
            "rank": 1,
            "rules": [
              {
                "id": "46",
                "levelId": "7",
                "expression": "entity.description() != null",
                
                "description": undefined,
                "title": "Has description",
                "cqlVersion": "2.0"
              },
              {
                "id": "50",
                "levelId": "7",
                "expression": "git.fileExists(\"README.md\")",
                
                "description": undefined,
                "title": "Repository has a README.md file",
                "cqlVersion": "2.0"
              },
              {
                "id": "42",
                "levelId": "7",
                "expression": "git != null",
                
                "description": undefined,
                "title": "Has a git repository",
                "cqlVersion": "2.0"
              },
              {
                "id": "43",
                "levelId": "7",
                "expression": "ownership.allOwners().length > 0",
                
                "description": undefined,
                "title": "Has owners",
                "cqlVersion": "2.0"
              }
            ]
          },
          {
            "id": "8",
            "name": "Silver",
            "color": "#8c9298",
            "description": undefined,
            "rank": 2,
            "rules": [
              {
                "id": "47",
                "levelId": "8",
                "expression": "links(\"dashboards\").length > 0",
                
                "description": undefined,
                "title": "Has at least one dashboard",
                "cqlVersion": "2.0"
              },
              {
                "id": "49",
                "levelId": "8",
                "expression": "links(\"runbooks\").length > 0",
                
                "description": undefined,
                "title": "Has at least one runbook",
                "cqlVersion": "2.0"
              },
              {
                "id": "48",
                "levelId": "8",
                "expression": "links(\"documentation\").length > 0",
                
                "description": undefined,
                "title": "Has at least one link of type documentation",
                "cqlVersion": "2.0"
              }
            ]
          },
          {
            "id": "9",
            "name": "Gold",
            "color": "#cda400",
            "description": undefined,
            "rank": 3,
            "rules": [
              {
                "id": "45",
                "levelId": "9",
                "expression": "slos().length > 0",
                
                "description": undefined,
                "title": "Has SLOs set up",
                "cqlVersion": "2.0"
              },
              {
                "id": "44",
                "levelId": "9",
                "expression": "oncall != null",
                
                "description": undefined,
                "title": "Has on-call rotation set up",
                "cqlVersion": "2.0"
              }
            ]
          }
        ]
      },
    },
    scores: [
      {
        "score": {
          "scorePercentage": 0,
          "score": 0,
          "totalPossibleScore": 19
        },
        "entity": {
          "id": "35",
          "cid": "en2e8a42777cb749df",
          "type": "service" as any,
          "name": "Example Website",
          "tag": "example-website",
          "description": undefined,
          "entityGroups": {
            "defined": [
              "system:examples"
            ],
            "all": [
              "system:examples"
            ]
          },
          "entityOwners": [],
          "ownerGroups": [
            "guests"
          ],
          "icon": {
            "kind": "cortex",
            "tag": "service",
            "url": "http://api.local.getcortexapp.com:8080/api/internal/v1/static?type=FS&kind=cortex&path=service"
          },
        },
        "evaluation": {
          "rules": [
            {
              "rule": {
                "id": "42",
                "expression": "git != null",
                "weight": 5,
                "description": undefined,
                "title": "Has a git repository",
                "failureMessage": "You can add a git repository by following the instructions in our docs for [Azure DevOps](https://docs.cortex.io/docs/reference/integrations/azuredevops), [Bitbucket](https://docs.cortex.io/docs/reference/integrations/bitbucket), [GitHub](https://docs.cortex.io/docs/reference/integrations/github), or [GitLab](https://docs.cortex.io/docs/reference/integrations/gitlab) depending on the tool that your team uses.",
                "dateCreated": "2024-07-25T09:03:13.049519",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "335eeb5e-bea8-37e2-ab50-de28d956998b"
              },
              "score": 0,
              "leftResult": undefined,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "43",
                "expression": "ownership.allOwners().length > 0",
                "weight": 5,
                "description": undefined,
                "title": "Has owners",
                "failureMessage": "You can add a owners by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/ownership).",
                "dateCreated": "2024-07-25T09:03:13.055499",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "92ab2234-ffb1-371b-9488-8ebe3485e503"
              },
              "score": 0,
              "leftResult": undefined,
              "error": "Internal: Missing service registration for Internal",
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "44",
                "expression": "oncall != null",
                "weight": 2,
                "description": undefined,
                "title": "Has on-call rotation set up",
                "failureMessage": "You can add an on-call rotation by following the instructions in our docs for [Opsgenie](https://docs.cortex.io/docs/reference/integrations/opsgenie), [Pagerduty](https://docs.cortex.io/docs/reference/integrations/pagerduty), or [VictorOps](https://docs.cortex.io/docs/reference/integrations/victorops) depending on the tool that your team uses.",
                "dateCreated": "2024-07-25T09:03:13.076328",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "2a2e6d7e-9ea1-3df6-a2a1-8db501126d53"
              },
              "score": 0,
              "leftResult": undefined,
              "error": "Oncall: Missing integration for Oncall",
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "45",
                "expression": "slos().length > 0",
                "weight": 2,
                "description": undefined,
                "title": "Has SLOs set up",
                "failureMessage": "You can add SLOs by following the instructions in our docs for [Datadog](https://docs.cortex.io/docs/reference/integrations/datadog), [Lightstep](https://docs.cortex.io/docs/reference/integrations/lightstep), [Prometheus](https://docs.cortex.io/docs/reference/integrations/prometheus), or [SignalFX](https://docs.cortex.io/docs/reference/integrations/signalfx) depending on the tool that your team uses.",
                "dateCreated": "2024-07-25T09:03:13.086765",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "860ccd45-64b6-35c3-946b-8b3e961d6705"
              },
              "score": 0,
              "leftResult": 0,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "46",
                "expression": "entity.description() != null",
                "weight": 1,
                "description": undefined,
                "title": "Has description",
                "failureMessage": "You can add a description by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/entities).",
                "dateCreated": "2024-07-25T09:03:13.113599",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "945e4ff1-f775-3f3b-8b66-7199e1a595ab"
              },
              "score": 0,
              "leftResult": undefined,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "47",
                "expression": "links(\"dashboards\").length > 0",
                "weight": 1,
                "description": undefined,
                "title": "Has at least one dashboard",
                "failureMessage": "You can add a link of type dashboard by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
                "dateCreated": "2024-07-25T09:03:13.1181",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "1574e553-c46a-3119-9a3a-68b5c0cd8d2d"
              },
              "score": 0,
              "leftResult": 0,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "48",
                "expression": "links(\"documentation\").length > 0",
                "weight": 1,
                "description": undefined,
                "title": "Has at least one link of type documentation",
                "failureMessage": "You can add a link of type documentation by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
                "dateCreated": "2024-07-25T09:03:13.124145",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "598a9e1f-0287-3c2c-86c9-d011c9672af1"
              },
              "score": 0,
              "leftResult": 0,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "49",
                "expression": "links(\"runbooks\").length > 0",
                "weight": 1,
                "description": undefined,
                "title": "Has at least one runbook",
                "failureMessage": "You can add a link of type runbook by following the instructions in [our docs](https://docs.cortex.io/docs/reference/basics/external-docs#links).",
                "dateCreated": "2024-07-25T09:03:13.12899",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "c2726668-13ec-33ba-8b24-ef8824ba72d4"
              },
              "score": 0,
              "leftResult": 0,
              "error": undefined,
              "type": "APPLICABLE" as any
            },
            {
              "rule": {
                "id": "50",
                "expression": "git.fileExists(\"README.md\")",
                "weight": 1,
                "description": undefined,
                "title": "Repository has a README.md file",
                "failureMessage": "Add a README.md file to the repository specified. If you don't have a repository specified, you can add one by following the instructions in our docs for [Azure DevOps](/admin/settings/azuredevops), [Bitbucket](/admin/settings/bitbucket), [GitHub](/admin/settings/github), or [GitLab](/admin/settings/gitlab) depending on the tool that your team uses.\n\nIf you already have a README.md file, keep in mind that this rule is case sensitive. To change this, you can update it to be something like \"git.fileExists(\"README.md\") or git.fileExists(\"readme.md\")\".",
                "dateCreated": "2024-07-25T09:03:13.133902",
                "filter": null,
                "cqlVersion": "2.0",
                "effectiveFrom": null,
                "identifier": "7ea7acc8-b314-344c-b23c-ba4bb95ca6ef"
              },
              "score": 0,
              "leftResult": undefined,
              "error": "Git: Missing service registration for Git",
              "type": "APPLICABLE" as any
            }
          ],
          "ladderLevels": [
            {
              "currentLevel": undefined,
              "nextLevel": {
                "id": "7",
                "name": "Bronze",
                "color": "#c38b5f",
                "rank": 1
              },
              "rulesToComplete": [
                {
                  "id": "46",
                  "levelId": "7",
                  "expression": "entity.description() != null",
                  "description": undefined,
                  "title": "Has description",
                  "cqlVersion": "2.0"
                },
                {
                  "id": "50",
                  "levelId": "7",
                  "expression": "git.fileExists(\"README.md\")",
                  "description": undefined,
                  "title": "Repository has a README.md file",
                  "cqlVersion": "2.0"
                },
                {
                  "id": "42",
                  "levelId": "7",
                  "expression": "git != null",
                  "description": undefined,
                  "title": "Has a git repository",
                  "cqlVersion": "2.0"
                },
                {
                  "id": "43",
                  "levelId": "7",
                  "expression": "ownership.allOwners().length > 0",
                  "description": undefined,
                  "title": "Has owners",
                  "cqlVersion": "2.0"
                }
              ]
            }
          ],
          "lastUpdated": "2024-07-25T09:03:13.140119"
        }
      }
    ],
    setFilters,
    teamsByEntity: {
      "28": [],
      "29": [],
      "30": [],
      "31": [],
      "32": [],
      "33": [],
      "34": [],
      "35": [],
      "36": []
    },
  });

  console.log('aa', filters);

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
          <BirdsEyeReportTable
            {...tableData}
            emptyResultDisplay={<EmptyState title="Select a Scorecard" missing="data" />}
            filters={filters}
            getCellColorClassName={() => 'aa'}
            getScoreColorClassName={() => 'bb'}
            getScorecardEntityUrl={() => ''}
            setFilters={setFilters}
          />
        </Grid>
      </Grid>
    </>
  );
};
