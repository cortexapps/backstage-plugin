/*
 * Copyright 2022 Cortex Applications, Inc.
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
import React from "react";
import { fireEvent, Matcher, queryByText, render, screen } from "@testing-library/react";
import { TestApiProvider, wrapInTestApp } from "@backstage/test-utils";
import { cortexApiRef } from "../api";
import { CortexApi } from "../api/CortexApi";
import { ExternalRouteRef, RouteRef } from "@backstage/core-plugin-api";
import { Scorecard, ScorecardServiceScore } from "../api/types";
import { Entity, EntityMeta } from "@backstage/catalog-model";
import { act } from "react-dom/test-utils";

export const renderWrapped = (
  children: React.ReactNode,
  cortexApi?: Partial<CortexApi>,
  mountedRoutes?: {
    [path: string]: RouteRef | ExternalRouteRef;
  },
  ...additionalApis: [any, any][]
) => {
  const cortexRefPair: [any, any][] = cortexApi ? [[cortexApiRef, cortexApi]] : []
  const rendered = render(
    wrapInTestApp(
      <TestApiProvider apis={[...cortexRefPair, ...additionalApis]}>
        {children}
      </TestApiProvider>,
      { mountedRoutes },
    ),
  );

  const { findByText, findAllByText, findByLabelText, container, ...rest } = rendered;

  const checkForText = async (matcher: Matcher, index?: number) => {
    if (index === undefined) {
      expect(await findByText(matcher)).toBeVisible();
    } else {
      expect((await findAllByText(matcher))[index]).not.toBe([]);
    }
  }

  const checkNotText = async (matcher: Matcher) => {
    expect(await queryByText(container, matcher)).toBeNull();
  }

  const clickButton = async (label: string) => {
    return act(async () => {
      fireEvent.click(await findByLabelText(label));
    });
  }

  const mouseClick = async (label: string) => {
    return act(async () => {
      const element = await findByLabelText(label)
      fireEvent.mouseDown(element);
      fireEvent.click(element);
    });
  }

  const clickButtonByText = async (label: string) => {
    return act(async () => {
      fireEvent.click(await findByText(label));
    });
  }

  return {
    ...rendered,
    clickButton,
    clickButtonByText,
    mouseClick,
    checkForText,
    checkNotText,
    logScreen,
    ...rest,
  }
}

const logScreen = () => {
  screen.debug(undefined, 40000);
}

export class Fixtures {
  static scorecard: (partial?: Partial<Scorecard>) => Scorecard = (partial) => {
    return {
      creator: { name: 'Bob Jones', email: 'bobjones@cortex.io' },
      id: 1,
      name: 'My Scorecard',
      description: 'My Description',
      rules: [
        { id: 2, expression: 'runbooks.count > 0', description: 'My Rule', weight: 10 },
        { id: 3, expression: 'documentation.count > 0', weight: 20 },
      ],
      tags: [{ id: '1', tag: 'tag1' }],
      excludedTags: [{ id: '2', tag: 'tag2' }],
      ...partial
    }
  }

  static scorecardServiceScore: (partial?: Partial<ScorecardServiceScore>) => ScorecardServiceScore = (partial) => {
    return {
      serviceId: 1,
      componentRef: 'Component:foo/bar',
      score: 2,
      scorePercentage: 0.5,
      totalPossibleScore: 4,
      rules: [],
      lastUpdated: '2022-06-14T01:19:37+0000',
      tags: [],
      teams: [],
      ladderLevels: [],
      ...partial
    }
  }

  static entity: (partial?: Partial<Entity>) => Entity = (partial) => {
    return {
      apiVersion: '1',
      kind: 'Component',
      metadata: Fixtures.entityMeta(),
      ...partial
    }
  }

  static entityMeta: (partial?: Partial<EntityMeta>) => EntityMeta = (partial) => {
    return {
      name: 'Foo',
      ...partial
    }
  }
}
