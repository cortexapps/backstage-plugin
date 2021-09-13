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
import React, { useCallback, useState } from 'react';

export function useDropdown<T>(
  initialValue: T | undefined,
): [T | undefined, (event: React.ChangeEvent<{ value: unknown }>) => void] {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const onChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setValue(event.target.value as T | undefined);
    },
    [setValue],
  );

  return [value, onChange];
}
