import { cortexPlugin } from "./plugin";
import { createComponentExtension } from "@backstage/core-plugin-api";

export const CortexComponent = cortexPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/CortexComponent').then(
          m => m.CortexComponent,
        ),
    },
  }),
);

export const ScorecardsPage = cortexPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/Scorecards/ScorecardsPage').then(
          m => m.ScorecardsPage,
        ),
    },
  }),
);
