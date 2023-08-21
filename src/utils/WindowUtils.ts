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

import { isNil } from 'lodash';

const copyFallback = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    // noinspection JSDeprecatedSymbols
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
};

export const copyText = async (
  text?: string,
  onSuccess?: () => void,
  onFail?: () => void,
) => {
  if (isNil(text)) {
    return;
  }

  try {
    navigator.clipboard
      ? await navigator.clipboard.writeText(text)
      : copyFallback(text);

    onSuccess?.();
  } catch (err) {
    onFail?.();
    console.error(text);
  }
};
