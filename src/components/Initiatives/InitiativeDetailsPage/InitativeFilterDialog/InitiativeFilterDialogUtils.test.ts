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
  FilterDefinitionName,
  toQueryParams,
  useFiltersFromQueryParams,
} from './InitiativeFilterDialogUtils';

const davidsEmailAddress = 'david.barnes@cortex.io';

describe('InitiativeFilterDialogUtils', () => {
  describe('toQueryParams', () => {
    it('should return empty object when filters are empty', () => {
      expect(toQueryParams({}, {}, [])).toEqual({});
    });

    it('should convert owner filters to query params', () => {
      expect(
        toQueryParams(
          {
            [`${FilterDefinitionName.EmailOwners}${davidsEmailAddress}`]: true,
          },
          {},
          [
            {
              filters: {
                '1': {
                  display: davidsEmailAddress,
                  id: davidsEmailAddress,
                  value: davidsEmailAddress,
                },
              },
              name: FilterDefinitionName.EmailOwners,
            },
          ],
        ),
      ).toEqual({
        [FilterDefinitionName.EmailOwners]: [davidsEmailAddress],
      });
    });

    it('should omit false values', () => {
      expect(
        toQueryParams(
          {
            [`${FilterDefinitionName.FailingRules}1`]: false,
          },
          {},
          [
            {
              filters: {
                '1': {
                  display: 'Has description',
                  id: '1',
                  value: 'entity.description() != null',
                },
              },
              name: FilterDefinitionName.FailingRules,
            },
          ],
        ),
      ).toEqual({});
    });
  });

  describe('useFiltersFromQueryParams', () => {
    it('should return empty object when filters are empty', () => {
      expect(useFiltersFromQueryParams('')).toEqual({
        filters: {},
        oneOf: {},
      });
    });

    it('should convert owner filters from query params', () => {
      expect(
        useFiltersFromQueryParams(
          `${FilterDefinitionName.EmailOwners}=${davidsEmailAddress}`,
        ),
      ).toEqual({
        filters: {
          [`${FilterDefinitionName.EmailOwners}${davidsEmailAddress}`]: true,
        },
        oneOf: {},
      });
    });

    it('should convert multiple owner filters from query params', () => {
      const queryParams = `${FilterDefinitionName.EmailOwners}=${davidsEmailAddress}&${FilterDefinitionName.EmailOwners}=notdavid@cortex.io&oneOf__${FilterDefinitionName.EmailOwners}=false`;

      expect(useFiltersFromQueryParams(queryParams)).toEqual({
        filters: {
          [`${FilterDefinitionName.EmailOwners}${davidsEmailAddress}`]: true,
          [`${FilterDefinitionName.EmailOwners}notdavid@cortex.io`]: true,
        },
        oneOf: {
          [FilterDefinitionName.EmailOwners]: false,
        },
      });
    });
  });
});
