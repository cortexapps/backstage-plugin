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
import {useApi, identityApiRef} from "@backstage/core-plugin-api";
import {cortexApiRef} from "../../api";
import {useAsync} from "react-use";
import {EmptyState, InfoCard, Progress, WarningPanel} from "@backstage/core-components";
import {isNil} from "lodash";
import moment from "moment";
import {Oncall} from "../../api/types";
import {Typography} from "@material-ui/core";
import {getDisplayTimeUntilNextOncall, getOncallSchedulesDisplayName} from "./HomePageUtils";

export const getDisplayForCurrentOncalls = (oncalls: Oncall[]) => {
    return (
    <InfoCard
      title="On-Call"
    >
        <Typography>
            You're currently on call for {getOncallSchedulesDisplayName(oncalls)}
        </Typography>
    </InfoCard>
    )
};

const getDisplayForNextOncalls = (oncalls: Oncall[]) => {
    const nextOncallTime = moment(oncalls[0].startDate);
    const allNextOncalls = oncalls.filter((oncall) =>
        moment(oncall.startDate).isSameOrBefore(nextOncallTime)
    );

    return (
        <InfoCard
          title="On-Call"
        >
            <Typography>
                You're on call for {getOncallSchedulesDisplayName(allNextOncalls)} in{' '}
                {getDisplayTimeUntilNextOncall(nextOncallTime.toISOString())}
            </Typography>
        </InfoCard>
    );
};

export const HomepageOncallCard = () => {
    const cortexApi = useApi(cortexApiRef)
    const identityApi = useApi(identityApiRef);

    const {
        value: oncall,
        loading,
        error,
    } = useAsync(async () => {
        const profileInfo = await identityApi.getProfileInfo()
        if (profileInfo.email) {
            return await cortexApi.getUserOncallByEmail(profileInfo.email);
        } else {
            throw Error('No user email found')
        }
    }, []);

    if (loading) {
        return <Progress />
    }

    if (error) {
        return (
            <WarningPanel severity="error" title="Could not load insights.">
                {error.message}
            </WarningPanel>
        );
    }

    if (!oncall?.oncalls.length) {
        return (
            <EmptyState
              missing="info"
              title="No on-call to display"
              description="You have no on-call provider set up."
            />
        )
    }

    const now = moment.now();
    const currentOncalls = oncall?.oncalls.filter(
        (oncall) => isNil(oncall.startDate) || moment(oncall.startDate).isBefore(now)
    );
    const firstOncall = oncall?.oncalls[0];

    if (!firstOncall?.startDate || moment(firstOncall!.startDate).isBefore(now)) {
        return (
            getDisplayForCurrentOncalls(currentOncalls ?? [])
        )
    }

    return (
        getDisplayForNextOncalls(oncall?.oncalls ?? [])
    )
};
