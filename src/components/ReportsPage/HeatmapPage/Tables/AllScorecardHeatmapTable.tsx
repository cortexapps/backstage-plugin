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
import React, {useMemo} from 'react';
import TableRow from '@material-ui/core/TableRow/TableRow';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { TableCell} from '@material-ui/core';
import {HeatmapCell} from '../HeatmapCell';
import {EntityRefLink} from '@backstage/plugin-catalog-react';
import {parseEntityName} from '@backstage/catalog-model';
import {defaultComponentRefContext} from '../../../../utils/ComponentUtils';
import { ScoresByIdentifier} from "../../../../api/types";
import {HeatmapTableHeader} from "../Tables/HeatmapTableHeader";
import {getFormattedScorecardScores} from "../HeatmapUtils";

interface AllScorecardsHeatmapTableProps {
    scorecardNames: string[];
    serviceScores: ScoresByIdentifier[];
}

export const AllScorecardsHeatmapTable = ({ scorecardNames, serviceScores }: AllScorecardsHeatmapTableProps) => {
   const data = useMemo(() => getFormattedScorecardScores(scorecardNames, serviceScores), [scorecardNames, serviceScores])
    const headers = ['Entity', 'Average Score', ...scorecardNames];

    return (
        <Table>
            <HeatmapTableHeader headers={headers} />
            <TableBody>
                {data.map(groupScore => {
                    return (
                        <TableRow key={groupScore.identifier}>
                            <TableCell>
                                <EntityRefLink
                                    entityRef={parseEntityName(
                                        groupScore.identifier!!,
                                        defaultComponentRefContext,
                                    )}
                                />
                            </TableCell>
                            <HeatmapCell
                                score={groupScore.averageScore}
                            />
                            {groupScore.scores.map((score, idx) => (
                                    <React.Fragment key={`ReportsTableRuleRow-${idx}`}>
                                        <HeatmapCell
                                            score={score?.scorePercentage}
                                            text={score !== undefined ? undefined : 'N/A'}
                                        />
                                    </React.Fragment>
                                )
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
