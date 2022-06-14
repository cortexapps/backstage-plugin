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
import React from 'react';
import { Fixtures, renderWrapped } from "../../../../utils/TestUtils";
import { ScorecardMetadataCard } from "./ScorecardMetadataCard";

describe('ScorecardMetadataCard', () => {

  it('should render metadata', async () => {
    const scorecard = Fixtures.scorecard({
      creator: { name: 'Bob Jones', email: 'bobjones@cortex.io' },
      description: 'My Description',
      tags: [{ id: '1', tag: 'tag1' }],
      excludedTags: [{ id: '2', tag: 'tag2' }],
    })
    const { findByText } = renderWrapped(<ScorecardMetadataCard scorecard={scorecard} scores={[]}/>);

    expect(await findByText('Bob Jones')).toBeVisible();
    expect(await findByText('My Description')).toBeVisible();
    expect(await findByText('tag1')).toBeVisible();
    expect(await findByText('tag2')).toBeVisible();
  });
});

