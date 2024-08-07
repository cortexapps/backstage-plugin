/*
 * Copyright 2024 Cortex Applications, Inc.
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
import React, { ReactNode, useCallback } from 'react';
import { Button } from '@material-ui/core';
import { copyText } from '../../utils/WindowUtils';

interface CopyButtonProps {
  textToCopy: string | (() => string);
  children: ReactNode;
  'aria-label'?: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  children,
  onSuccess,
  onFail,
  'aria-label': ariaLabel,
}) => {
  const onCopyClicked = useCallback(async () => {
    const text = typeof textToCopy === 'function' ? textToCopy() : textToCopy;

    return copyText(text, onSuccess, onFail);
  }, [onFail, onSuccess, textToCopy]);

  return (
    <Button
      variant="contained"
      color="primary"
      aria-label={ariaLabel}
      onClick={onCopyClicked}
    >
      {children}
    </Button>
  );
};
