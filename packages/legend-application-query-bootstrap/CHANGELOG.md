# @finos/legend-application-query-bootstrap

## 7.1.0

## 7.0.0

### Major Changes

- [#1332](https://github.com/finos/legend-studio/pull/1332) [`5f0c6f6b`](https://github.com/finos/legend-studio/commit/5f0c6f6b40ece8a3b87c32b52f15f542fe68f7d4) ([@akphi](https://github.com/akphi)) - **BREAKING CHANGE:** Renamed package from `@finos/legend-query-app` to `@finos/legend-application-query-bootstrap`. Also, methods returning the collection of plugins and presets like `getLegendQueryPresetCollection()` and `getLegendQueryPluginCollection()` are no longer exported, instead, use `LegendQueryWebApplication.getPresetCollection()` and `LegendQueryWebApplication.getPluginCollection()`.
