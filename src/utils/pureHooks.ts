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
import {
  EffectCallback,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';

// Equivalent to componentDidMount
export const useMountEffect = (fun?: EffectCallback) =>
  useEffect(() => fun?.(), []); // eslint-disable-line react-hooks/exhaustive-deps

const getSize = (el: HTMLElement | null): { height: number; width: number } => {
  if (!el) {
    return {
      height: 0,
      width: 0,
    };
  }

  return {
    height: el.offsetHeight,
    width: el.offsetWidth,
  };
};

export const useDimensions = <T extends HTMLElement>(ref: RefObject<T>) => {
  const [componentSize, setComponentSize] = useState(
    getSize(ref ? ref.current : null),
  );

  const handleResize = useCallback(() => {
    setComponentSize({
      height: ref.current ? ref.current.offsetHeight : 0,
      width: ref.current ? ref.current.offsetWidth : 0,
    });
  }, [ref, setComponentSize]);

  const [observer] = useState<ResizeObserver | undefined>(() => {
    if (typeof ResizeObserver === 'function') {
      return new ResizeObserver(() => {
        handleResize();
      });
    }

    return undefined;
  });

  useMountEffect(() => {
    if (typeof ResizeObserver !== 'function') {
      window.addEventListener('resize', handleResize);
    }

    handleResize();

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  });

  return componentSize;
};
