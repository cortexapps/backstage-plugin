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
import React from "react";
import { HeatmapReportItem } from "../../../api/types";
import { Accordion, AccordionDetails, AccordionSummary, TableCell, TableRow, Typography } from "@material-ui/core";
import { BirdsEyeTableCell } from "./BirdsEyeTableCell";
import { maybePluralize } from "../../../utils/strings";
import { round } from "lodash";
import { ExpandMore } from "@material-ui/icons";
import { EntityRefLink } from "@backstage/plugin-catalog-react";
import { parseEntityRef } from "@backstage/catalog-model";
import { defaultComponentRefContext } from "../../../utils/ComponentUtils";

export interface TableHeaderItem {
  id: string;
  title: string;
}

interface BirdsEyeTableRowProps {
  item: HeatmapReportItem;
  headersById: TableHeaderItem[];
}

export const BirdsEyeTableRow: React.FC<BirdsEyeTableRowProps> = ({ item, headersById }) => {
  return (
    <TableRow>
      <TableCell>
        {item.key.id === -1
          ? <>{item.key.name}</>
          : <EntityRefLink
              entityRef={parseEntityRef(
                item.key.tag,
                defaultComponentRefContext,
              )}
              title={item.key.name}
            />
        }
      </TableCell>
      {item.value.value ? (
        <>
          {headersById.map(({ id: key }) => {
            const value = item.value.value?.[key] ?? 0;
            return (
              <TableCell key={`${item.key.tag}-${key}`}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={item.key.id !== -1 && <ExpandMore />}
                    disabled={value === 0}
                  >
                    <Typography variant="h6" style={{ display: 'inline-block' }}>
                      {maybePluralize(value, 'service')}
                    </Typography>
                  </AccordionSummary>
                  {item.key.id !== -1 && (
                    <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                      <EntityRefLink
                        entityRef={parseEntityRef(
                          item.key.tag,
                          defaultComponentRefContext,
                        )}
                      />
                    </AccordionDetails>
                  )}
                </Accordion>
              </TableCell>
            );
          })}
        </>
      ) : (
        <>
          <BirdsEyeTableCell
            score={item.value.ruleScores.scorePercentage}
            text={`${round(item.value.ruleScores.scorePercentage * 100)}%`}
          />
          {headersById.map(({ id: key }) => {
            const score = item.value.ruleResult?.results?.[key]?.score ?? 0;
            return (
              <BirdsEyeTableCell
                key={`BirdsEyeCell-${item.key.tag}-${key}`}
                score={score > 0 ? 1 : 0}
                text={score > 0 ? '1' : '0'}
              />
            )
          })}
        </>
      )}
    </TableRow>
  )
}
