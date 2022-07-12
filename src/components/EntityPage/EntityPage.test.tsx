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
import { CortexApi } from "../../api/CortexApi";
import React from "react";
import { Fixtures, renderWrapped } from "../../utils/TestUtils";
import { EntityPage } from "./EntityPage";
import { EntityProvider } from "@backstage/plugin-catalog-react";

describe('EntityPage', () => {
  const emptyCortexApi: Partial<CortexApi> = {
    getServiceScores: () =>
      Promise.resolve([]),
  };

  const entity = Fixtures.entity()

  it('should render if there are no scorecard service scores', async () => {
    const { findByText } = renderWrapped(<EntityProvider entity={entity}><EntityPage /></EntityProvider>, emptyCortexApi);
    expect(await findByText('No Scorecards to display')).toBeVisible();
    expect(await findByText('You haven\'t added any Scorecards yet.')).toBeVisible();
  });
});
