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

export const HomePage = () => {
    const currTime = useMemo(() => moment(), []);

    const helloMessage = useMemo(() => {
        const currHour = currTime.hour();

        if (currHour < 12) {
            return `☀️ Good morning`;
        } else if (currHour < 18) {
            return `☀️ Good afternoon`;
        } else {
            return `🌅 Good evening`;
        }
    }, [currTime]);

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
