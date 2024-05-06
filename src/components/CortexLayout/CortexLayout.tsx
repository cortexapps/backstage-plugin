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

import { Children, default as React, Fragment, isValidElement } from 'react';

import { attachComponentData } from '@backstage/core-plugin-api';
import { Header, Page, RoutedTabs } from '@backstage/core-components';

type SubRoute = React.ComponentProps<typeof RoutedTabs>['routes'][number];

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

  return (
    <Page themeId="home">
      <Header
        title={title ?? 'Explore our ecosystem'}
        subtitle={subtitle ?? 'Discover solutions available in our ecosystem'}
      />
      {hideContent ? null : <RoutedTabs routes={routes} />}
    </Page>
  );
};

CortexLayout.Route = Route;
