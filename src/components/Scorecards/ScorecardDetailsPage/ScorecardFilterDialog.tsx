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
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@material-ui/core';
import { ScorecardFilterCard } from './ScorecardFilterCard';
import { Scorecard } from '../../../api/types';

interface ScorecardFilterDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  scorecard: Scorecard;
  filters: any;
  setFilter: Function;
  checkedFilters: Record<string, boolean>;
  setCheckedFilters: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}
const ScorecardFilterDialog = ({
  isOpen,
  handleClose,
  scorecard,
  filters,
  setFilter,
  checkedFilters,
  setCheckedFilters,
}: ScorecardFilterDialogProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <ScorecardFilterCard
          scorecard={scorecard}
          filters={filters}
          setFilter={newFilter => setFilter(() => newFilter)}
          checkedFilters={checkedFilters}
          setCheckedFilters={setCheckedFilters}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScorecardFilterDialog;
