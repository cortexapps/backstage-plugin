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

import { TabProps, Typography } from '@material-ui/core';
import { Children, default as React, Fragment, isValidElement } from 'react';

import { attachComponentData, configApiRef, useApi } from '@backstage/core-plugin-api';
import { Header, Page, RoutedTabs } from '@backstage/core-components';

type SubRoute = {
  path: string;
  title: string;
  children: JSX.Element;
  tabProps?: TabProps<React.ElementType, { component?: React.ElementType }>;
};

const Route: (props: SubRoute) => null = () => null;

// This causes all mount points that are discovered within this route to use the path of the route itself
attachComponentData(Route, 'core.gatherMountPoints', true);

function createSubRoutesFromChildren(
  childrenProps: React.ReactNode,
): SubRoute[] {
  // Directly comparing child.type with Route will not work with in
  // combination with react-hot-loader in storybook
  // https://github.com/gaearon/react-hot-loader/issues/304
  const routeType = (
    <Route path="" title="">
      <div />
    </Route>
  ).type;

  return Children.toArray(childrenProps).flatMap(child => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === Fragment) {
      return createSubRoutesFromChildren(child.props.children);
    }

    if (child.type !== routeType) {
      throw new Error('Child of CortexLayout must be a CortexLayout.Route');
    }

    const { path, title, children, tabProps } = child.props;
    return [{ path, title, children, tabProps }];
  });
}

type CortexLayoutProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  hideContent?: boolean;
};

export const CortexLayout = ({
  title,
  subtitle,
  children,
  hideContent,
}: CortexLayoutProps) => {
  const routes = createSubRoutesFromChildren(children);

  const config = useApi(configApiRef);
  const headerConfig = config.getOptionalConfig('cortex.header');
  const customTitle = headerConfig?.getOptionalString('title');
  const customTitleComponent = customTitle && (
    <>
      {customTitle}
      <Typography variant='subtitle1'>Powered by Cortex</Typography>
    </>
  );

  return (
    <Page themeId="home">
      <Header
        title={title ?? customTitleComponent ?? 'Cortex'}
        pageTitleOverride='Cortex'
        subtitle={subtitle ?? headerConfig?.getOptionalString('subtitle') ?? 'Understand and improve your services.'}
      />
      {hideContent ? null : <RoutedTabs routes={routes} />}
    </Page>
  );
};

CortexLayout.Route = Route;
