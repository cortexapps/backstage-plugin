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
import React from 'react';
import {
    RuleName,
    ruleName,
    ScorecardServiceScoresRule,
} from '../../../../api/types';
import {
    Grid,
    ListItem,
    ListItemAvatar,
    ListItemText,
    makeStyles,
    Typography,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles({
    rule: {
        borderRadius: 8,
    },
});

export type ScorecardServiceScoreRuleName = Omit<
    ScorecardServiceScoresRule,
    'rule'
    > & { rule: RuleName & { weight: number; } };

interface RuleResultDetailsProps {
    rule: ScorecardServiceScoreRuleName;
    hideWeight?: boolean;
}

export const RuleResultDetails = ({
                                      rule,
                                      hideWeight,
                                  }: RuleResultDetailsProps) => {
    const classes = useStyles();

    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                {rule.score > 0 ? (
                    <CheckIcon color="primary" />
                ) : (
                    <ErrorIcon color="error" />
                )}
            </ListItemAvatar>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                className={classes.rule}
            >
                <Grid item xs={9}>
                    <ListItemText
                        primary={ruleName(rule.rule)}
                        style={{ wordWrap: 'break-word' }}
                    />
                </Grid>
                {hideWeight !== true && (
                    <Grid item>
                        <ListItemText primary={`${rule.rule.weight}`} />
                    </Grid>
                )}
                {rule.error && (
                    <Grid item xs={9}>
                        <Typography color="error" style={{ wordWrap: 'break-word' }}>
                            {rule.error}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </ListItem>
    );
};