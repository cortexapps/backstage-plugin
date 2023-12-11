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

import React, { PropsWithChildren, useContext, useState } from 'react';

interface FilterContextState {
  checkedFilters: Record<string, boolean>;
  setCheckedFilters: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  oneOf: Record<string, boolean>;
  setOneOf: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const FilterContext = React.createContext<FilterContextState | undefined>(
  undefined,
);

interface FilterProviderProps extends PropsWithChildren {}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [checkedFilters, setCheckedFilters] = useState<Record<string, boolean>>(
    {},
  );
  const [oneOf, setOneOf] = useState<Record<string, boolean>>({});

  return (
    <FilterContext.Provider
      value={{
        checkedFilters,
        setCheckedFilters,
        oneOf,
        setOneOf,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useFilter was used outside of its Provider');
  }

  return context;
};
