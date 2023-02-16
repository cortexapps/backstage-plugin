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
import React, { useMemo } from 'react';
import {WarningPanel, Progress} from "@backstage/core-components";
import {identityApiRef, useApi} from "@backstage/core-plugin-api";
import {cortexApiRef} from "../../api";
import {useAsync} from "react-use";
import {ActionItemUserInsight, UserInsightType} from "../../api/types/UserInsightsTypes";
import moment from "moment";
import {Moment} from "moment/moment";
import {HomePageInsightCard} from "./HomePageInsightCard"

const MAX_NUM_INSIGHTS_TO_SHOW = 3;

export function isSameOrAfterToday(input: Moment): boolean {
    return input.isSameOrAfter(moment(), 'date');
}

export const HomePageInsights = () => {
    const cortexApi = useApi(cortexApiRef)
    const identityApi = useApi(identityApiRef);

    const {
        value: scorecards,
        loading: loadingScorecards,
        error: errorScorecards,
    } = useAsync(async () => {
        return await cortexApi.getScorecards();
    }, []);

    const {
        value: initiatives,
        loading: loadingInitiatives,
        error: errorInitiatives,
    } = useAsync(async () => {
        return await cortexApi.getInitiatives();
    }, []);

    const {
        value: insights,
        loading: loadingInsights,
        error: errorInsights,
    } = useAsync(async () => {
        const profileInfo = await identityApi.getProfileInfo()
        if (profileInfo.email) {
            return await cortexApi.getInsightsByEmail(profileInfo.email);
        } else {
            throw Error('No user email found')
        }
    }, []);

    const {
        value: entities,
        loading: loadingEntities,
        error: errorEntities,
    } = useAsync(async () => {
        return await cortexApi.getCatalogEntities();
    }, []);

    const insightsToDisplay = useMemo(() => {
        // We don't want to show insights for expired Initiatives
        const filteredInsights =
            insights?.insights?.filter((insight) => {
                if (insight.type === UserInsightType.ACTION_ITEM) {
                    const targetDate = (insight as ActionItemUserInsight)?.targetDate;
                    return isSameOrAfterToday(moment(targetDate));
                }

                return true;
            }) ?? [];

        return filteredInsights.slice(0, MAX_NUM_INSIGHTS_TO_SHOW);
    }, [insights]);

    if (loadingScorecards || loadingInitiatives ||  loadingInsights || loadingEntities) {
        return <Progress />
    }

    if (errorScorecards || errorInitiatives || errorInsights || errorEntities) {
        return (
            <WarningPanel severity="error" title="Could not load home page.">
                {errorScorecards && errorScorecards.message}{' '}
                {errorInitiatives && errorInitiatives.message}{' '}
                {errorInsights && errorInsights.message}{' '}
                {errorEntities && errorEntities.message}
            </WarningPanel>
        );
    }

    return (
        <>
            {insightsToDisplay.map((insight, idx) => {
                return (
                <HomePageInsightCard
                  key={`InsightCard-${idx}`}
                  insight={insight}
                  scorecards={scorecards}
                  initiatives={initiatives}
                  entities={entities?.entities}
                />
                )
            })}
        </>
    )
};
