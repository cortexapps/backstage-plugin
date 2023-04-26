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
export interface Config {
  /** Configuration options for the Cortex plugin */
  cortex?: {
    /**
     * The 'frontendBaseUrl' attribute. It should point to the address of the Cortex frontend domain.
     * If not provided, frontend plugin will use 'https://app.getcortexapp.com'
     * @visibility frontend
     */
    frontendBaseUrl?: string;

    /**
     * The 'hideSettings' attribute. If true, settings tab + sync button will be hidden from all users, including admins.
     * @visibility frontend
     */
    hideSettings?: string;

    /**
     * The 'syncWithGzip' attribute. If true, the Cortex Backstage entity sync will use gzip.
     * If not provided, the Cortex Backstage entity sync will not use gzip.
     * @visibility frontend
     */
    syncWithGzip?: boolean;
  };
}
