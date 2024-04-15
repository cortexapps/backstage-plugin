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
import React, { useMemo, useState } from "react";
import { BackstageTheme } from "@backstage/theme";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles<BackstageTheme>(styles => ({
  linkButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: styles.palette.primary.main,
    cursor: 'pointer',
    fontSize: styles.typography.body2.fontSize,
    padding: 0,
  },
}));

interface TruncatedProps {
  text?: string;
  truncateToLines: number;
  renderText?: (text: string) => React.ReactElement
}

export const Truncated: React.FC<TruncatedProps> = ({ text = '', truncateToLines, renderText }) => {
  const classes = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);

  const allEndOfLines = useMemo(() => {
    return Array.from(text.matchAll(/\r\n|\r|\n/g)).map(a => a.index);
  }, [text]);

  const displayedText = useMemo(() => {
    if (isExpanded || allEndOfLines.length < truncateToLines) {
      return text;
    }

    return text.substring(0, allEndOfLines[truncateToLines]) + '...';
  },  [text, truncateToLines, isExpanded, allEndOfLines]);

  return (
    <>
      {renderText ? renderText(displayedText) : displayedText}
      {allEndOfLines.length > truncateToLines && (
        <button
          className={classes.linkButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      )}
    </>
  );
}
