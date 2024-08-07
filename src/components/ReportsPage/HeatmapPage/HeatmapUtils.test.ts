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

import {
  Filters,
  FilterType as BirdsEyeFilterType,
  HeaderType,
  PathType,
  Scorecard as BirdsEyeScorecard,
  ScorecardDetailsScore as BirdsEyeScorecardDetailsScore,
  DomainOwnerInheritance,
} from '@cortexapps/birdseye';
import {
  convertToBirdsEyeFilter,
  convertToBirdsEyeScorecard,
  convertToBirdsEyeScores,
  filtersToParams,
} from './HeatmapUtils';
import {
  CategoryFilter,
  FilterType,
  OwnerInheritance,
  Scorecard,
} from '../../../api/types';

describe('Heatmap utils', () => {
  const compoundFilter: Scorecard['filter'] = {
    type: FilterType.COMPOUND_FILTER,
    typeFilter: {
      include: true,
      types: ['type-1', 'type-2'],
    },
    cqlFilter: {
      category: 'Generic',
      cqlVersion: '1.0',
      query: 'tag != null',
      type: FilterType.CQL_FILTER,
    },
  };

  const cqlFilter: Scorecard['filter'] = {
    type: FilterType.CQL_FILTER,
    category: CategoryFilter.Service,
    cqlVersion: '1.0',
    query: 'tag != null',
  };

  const domainFilter: Scorecard['filter'] = {
    type: FilterType.DOMAIN_FILTER,
    entityGroupFilter: {
      entityGroups: ['included-group'],
      excludedEntityGroups: ['excluded-group'],
    },
  };

  const scorecard: Scorecard = {
    creator: {
      email: 'user@example.com',
      name: 'User',
    },
    exemptions: {
      autoApprove: false,
      enabled: false,
    },
    id: 123123123,
    isDraft: false,
    name: 'My Scorecard',
    notifications: {
      enabled: true,
    },
    rules: [
      {
        cqlVersion: '1.0',
        expression: 'tag != null',
        id: 221133,
        weight: 1,
        dateCreated: '2024-08-07T08:27:42Z',
      },
    ],
    filter: domainFilter,
    tag: 'my-scorecard',
  };

  it('converts filters to params', () => {
    const params = filtersToParams({
      dataFilters: {
        selectedDomains: ['domain-1', 'domain-2'],
        selectedEntities: ['entity-1'],
        selectedGroups: ['group-1'],
        selectedLevels: [],
        selectedOwners: ['owner-1'],
        selectedTeams: [],
      },
      headerType: HeaderType.Rules,
      hideTeamsWithoutServices: true,
      path: [
        {
          label: 'domain-path',
          type: PathType.DomainNode,
        },
        {
          label: 'group',
          type: PathType.GroupBy,
        },
      ],
      useHierarchy: false,
      scorecardId: '42',
    } as Filters);

    expect(params).toEqual({
      domain: ['domain-1', 'domain-2'],
      entity: ['entity-1'],
      group: ['group-1'],
      groupBy: 'group',
      headerType: 'rules',
      level: [],
      owner: ['owner-1'],
      scorecardId: '42',
      team: [],
    });
  });

  describe('convertToBirdsEyeFilter', () => {
    it('returns no filter', () => {
      expect(convertToBirdsEyeFilter(null)).toBeUndefined();
    });

    it('converts compound filter', () => {
      expect(convertToBirdsEyeFilter(compoundFilter)).toEqual({
        type: 'COMPOUND_FILTER',
        cqlFilter: {
          category: 'Generic',
          cqlVersion: '1.0',
          query: 'tag != null',
          type: BirdsEyeFilterType.CQL_FILTER,
        },
        typeFilter: {
          include: true,
          types: ['type-1', 'type-2'],
        },
      } as BirdsEyeScorecard['filter']);
    });

    it('converts CQL filter', () => {
      expect(convertToBirdsEyeFilter(cqlFilter)).toEqual({
        type: BirdsEyeFilterType.CQL_FILTER,
        category: CategoryFilter.Service,
        cqlVersion: '1.0',
        query: 'tag != null',
      } as BirdsEyeScorecard['filter']);
    });

    it('converts domain filter', () => {
      expect(convertToBirdsEyeFilter(domainFilter)).toEqual({
        type: BirdsEyeFilterType.DOMAIN_FILTER,
        entityGroupFilter: {
          entityGroups: ['included-group'],
          excludedEntityGroups: ['excluded-group'],
        },
      } as BirdsEyeScorecard['filter']);
    });
  });

  describe('convertToBirdsEyeScorecard', () => {
    it('converts the scorecard', () => {
      expect(convertToBirdsEyeScorecard(scorecard, undefined)).toEqual({
        creator: {
          email: 'user@example.com',
          name: 'User',
        },
        exemptions: {
          autoApprove: false,
          enabled: false,
        },
        id: '123123123',
        isDraft: false,
        name: 'My Scorecard',
        notifications: {
          enabled: true,
        },
        rules: [
          {
            cqlVersion: '1.0',
            dateCreated: '2024-08-07T08:27:42Z',
            expression: 'tag != null',
            id: '221133',
            weight: 1,
          },
        ],
        filter: {
          type: BirdsEyeFilterType.DOMAIN_FILTER,
          entityGroupFilter: {
            entityGroups: ['included-group'],
            excludedEntityGroups: ['excluded-group'],
          },
        },
        tag: 'my-scorecard',
      } as BirdsEyeScorecard);
    });
  });

  describe('convertToBirdsEyeScorecard', () => {
    it('converts the score', () => {
      expect(
        convertToBirdsEyeScores(
          [
            {
              cid: '445566',
              componentRef: 'my-service',
              entityOwners: [
                {
                  email: 'user@example.com',
                  inheritance: OwnerInheritance.None,
                  id: 556,
                },
              ],
              ladderLevels: [],
              lastUpdated: '2024-08-07T12:27:42Z',
              rules: [],
              score: 0,
              scorePercentage: 0,
              serviceId: 18,
              tags: ['my-group'],
              teams: [],
              totalPossibleScore: 10,
              description: 'My description',
            },
          ],
          [
            {
              id: 18,
              codeTag: 'my-service',
              groupNames: [],
              serviceGroupTags: [],
              name: 'My Service',
              serviceOwnerEmails: [],
              type: 'service',
            },
          ],
        ),
      ).toEqual([
        {
          entity: {
            cid: '445566',
            description: 'My description',
            entityGroups: {
              all: ['my-group'],
              defined: ['my-group'],
            },
            entityOwners: [
              {
                email: 'user@example.com',
                id: '556',
                inheritance: DomainOwnerInheritance.None,
              },
            ],
            id: '18',
            name: 'My Service',
            ownerGroups: [],
            tag: 'my-service',
            type: 'service',
          },
          evaluation: {
            ladderLevels: [],
            lastUpdated: '',
            rules: [],
          },
          score: {
            score: 0,
            scorePercentage: 0,
            totalPossibleScore: 10,
          },
        },
      ] as BirdsEyeScorecardDetailsScore[]);
    });
  });
});
