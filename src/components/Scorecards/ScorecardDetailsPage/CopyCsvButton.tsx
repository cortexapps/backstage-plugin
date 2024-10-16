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
import React, { useCallback, useState } from 'react';
import { CopyButton } from '../../Common/CopyButton';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopy';
import { ScorecardServiceScore } from '../../../api/types';
import { humanizeAnyEntityRef } from '../../../utils/types';
import { defaultComponentRefContext } from '../../../utils/ComponentUtils';
import { percentify } from '../../../utils/NumberUtils';
import { toCsv } from '../../../utils/collections';
import { StringIndexable } from '../../ReportsPage/AllScorecardsPage/HeatmapUtils';
import { HomepageEntity } from '../../../api/userInsightTypes';
import { IconButton, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface CopyCsvButtonProps {
  entitiesByTag: StringIndexable<HomepageEntity>;
  scores: ScorecardServiceScore[];
}

const CopyCsvButton = ({ entitiesByTag, scores }: CopyCsvButtonProps) => {
  const [isSnackbarOpened, setOpenSnackbar] = useState(false);

  const getCsv = useCallback(() => {
    const getName = (score: ScorecardServiceScore): string => {
      return (
        entitiesByTag[score.componentRef]?.name ??
        humanizeAnyEntityRef(score.componentRef, defaultComponentRefContext)
      );
    };

    const rows = scores
      .sort((score1, score2) => score2.scorePercentage - score1.scorePercentage)
      .map(score => [
        `${getName(score)} (${entitiesByTag[score.componentRef]?.codeTag})`,
        percentify(score.scorePercentage).toString(),
      ]);

    rows.unshift(['Service', 'Score']);

    return toCsv(rows);
  }, [entitiesByTag, scores]);

  const handleSnackbarClose = (_event: object, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <>
      <CopyButton
        textToCopy={getCsv}
        aria-label="Copy scores"
        onSuccess={() => setOpenSnackbar(true)}
      >
        <FileCopyOutlinedIcon />
        &nbsp;Copy scores
      </CopyButton>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={isSnackbarOpened}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={'Successfully copied text!'}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={event => handleSnackbarClose(event)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};

export default CopyCsvButton;
