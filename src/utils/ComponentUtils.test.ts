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
import { CustomMapping } from '@cortexapps/backstage-plugin-extensions';
import { Entity } from '@backstage/catalog-model';
import { applyCustomMappings } from './ComponentUtils';

describe('applyCustomMappings', () => {
  it('should work with one mapping', () => {
    const customMapping: CustomMapping = entity => {
      return {
        'x-cortex-git': {
          github: {
            repository: entity.metadata.name,
          },
        },
      };
    };

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
      spec: {
        'some-key': 'dont-delete',
      },
    };

    expect(applyCustomMappings(entity, [customMapping])).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
      spec: {
        'some-key': 'dont-delete',
        'x-cortex-git': {
          github: {
            repository: 'my-component',
          },
        },
      },
    });
  });

  it('should work with overlapping mappings', () => {
    const customMappings: CustomMapping[] = [
      entity => {
        return {
          'x-cortex-git': {
            github: {
              repository: entity.metadata.name,
            },
            gitlab: {
              repository: 'test',
            },
          },
        };
      },
      entity => {
        return {
          'x-cortex-git': {
            github: {
              repository: 'foobar',
            },
          },
          'x-cortex-oncall': {
            pagerduty: {
              id: '1',
              type: entity.kind,
            },
          },
        };
      },
    ];

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
      spec: {
        'some-key': 'dont-delete',
      },
    };

    expect(applyCustomMappings(entity, customMappings)).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-component',
      },
      spec: {
        'some-key': 'dont-delete',
        'x-cortex-git': {
          github: {
            repository: 'foobar',
          },
          gitlab: {
            repository: 'test',
          },
        },
        'x-cortex-oncall': {
          pagerduty: {
            id: '1',
            type: 'Component',
          },
        },
      },
    });
  });
});
