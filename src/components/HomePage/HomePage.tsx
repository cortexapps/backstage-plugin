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
import React, {useMemo} from 'react';
import {Content, ContentHeader, ItemCardGrid} from '@backstage/core-components';
import moment from "moment";
import {HomepageOncallCard} from "./HomepageOncallCard";
import {HomePageInsights} from "./HomePageInsights";
import {identityApiRef, useApi} from "@backstage/core-plugin-api";
import {useAsync} from "react-use";

export const HomePage = () => {
    const identityApi = useApi(identityApiRef);

    const currTime = useMemo(() => moment(), []);

    const name = useAsync(async () => {
        const profileInfo = await identityApi.getProfileInfo()
        return profileInfo.displayName
    })
    console.log(name)

    const helloMessage = useMemo(() => {
        const nameSuffix = name.loading ? '' : `, ${name.value}`;

        const currHour = currTime.hour();

        if (currHour < 12) {
            return `☀️ Good morning${nameSuffix}`;
        } else if (currHour < 18) {
            return `☀️ Good afternoon${nameSuffix}`;
        } else {
            return `🌅 Good evening${nameSuffix}`;
        }
    }, [currTime, name]);

    return (
        <Content>
            <ContentHeader title={helloMessage} />
            <ItemCardGrid>
                <HomepageOncallCard />
                <HomePageInsights />
            </ItemCardGrid>
        </Content>
    )
};
