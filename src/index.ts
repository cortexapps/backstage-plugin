/*
 * Copyright 2021 Cortex Applications, Inc.
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
import CortexIconComponent from './assets/cortex.icon.svg';
import { IconComponent } from '@backstage/core-plugin-api';

export {
  cortexPlugin,
  CortexPage,
  CortexScorecardWidget,
  CortexGroupActionItemsWidget,
  EntityCortexContent,
  SystemCortexContent,
  extendableCortexPlugin,
  CortexHomepage,
} from './plugin';
export { extensionApiRef } from './api/ExtensionApi';
export type { CortexScorecardWidgetProps } from './components/CortexScorecardWidget/CortexScorecardWidget';
export type {
  ExtensionApi,
  CortexYaml,
  CustomMapping,
} from '@cortexapps/backstage-plugin-extensions';
export type { EntityFilterGroup } from './filters';
export const CortexIcon: IconComponent = CortexIconComponent as IconComponent;
