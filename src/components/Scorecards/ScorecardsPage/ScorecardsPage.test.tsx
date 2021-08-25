import { CortexApi } from "../../../api/CortexApi";
import { render } from "@testing-library/react";
import { wrapInTestApp } from "@backstage/test-utils";
import React from "react";
import { ApiProvider, ApiRegistry } from "@backstage/core";
import { cortexApiRef } from "../../../api";
import { ScorecardsPage } from "./ScorecardsPage";
import { rootRouteRef } from "../../../routes";

describe('ScorecardsPage', () => {
  const cortexApi: Partial<CortexApi> = {
    getScorecards: () => Promise.resolve(
      [
        {
          creator: { name: 'Billy Bob', email: 'billybob@cortex.io' },
          id: '1',
          name: 'My Scorecard',
          description: 'Some description',
          rules: [],
          serviceGroups: [],
          nextUpdated: "2021-08-25T04:00:00",
        }
      ]
    )
  };

  const renderWrapped = (children: React.ReactNode) =>
    render(
      wrapInTestApp(
        <ApiProvider
          apis={ApiRegistry.from([
            [cortexApiRef, cortexApi],
          ])}
        >
          {children}
        </ApiProvider>,
        {
          mountedRoutes: {
            '/': rootRouteRef
          }
        }
      ),
    );

  it('should render', async () => {
    const { findByText } = renderWrapped(<ScorecardsPage />);
    expect(await findByText(/My Scorecard/)).toBeInTheDocument();
    expect(await findByText(/Some description/)).toBeInTheDocument();
    expect(await findByText(/Billy Bob/)).toBeInTheDocument();
  });
});
