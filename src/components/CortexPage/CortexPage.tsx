import { CortexLayout } from "../CortexLayout";
import React from 'react';
import { CortexComponent, ScorecardsPage } from "../../extensions";

export const CortexPage = () => {
  return (
    <CortexLayout
      title="Cortex"
      subtitle="Understand and improve your services."
    >
      <CortexLayout.Route path="scorecards" title="Scorecards">
        <ScorecardsPage />
      </CortexLayout.Route>
      <CortexLayout.Route path="components" title="Components">
        <CortexComponent />
      </CortexLayout.Route>
    </CortexLayout>
  );
}
