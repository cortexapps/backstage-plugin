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
import React, { useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core";
import { ExtensionApiDebugger } from "./ExtensionApiDebugger";

const useStyles = makeStyles({
  paperFullWidth: { height: 'calc(100% - 128px)' },
});

export interface ExtensionApiCardProps {
  customMappingsEnabled: boolean;
  groupOverridesEnabled: boolean;
}

export const ExtensionApiCard = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <InfoCard title="Debug Extension API">
      <Button onClick={() => setOpen(true)}>
        Open Debugger
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{
          paperFullWidth: classes.paperFullWidth
        }}
        fullWidth
        maxWidth="lg"
      >
        <ExtensionApiDebugger/>
      </Dialog>
    </InfoCard>
  );
};
