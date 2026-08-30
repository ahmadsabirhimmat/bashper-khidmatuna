import { createElement, useCallback, useState } from "react";
import * as ReactNative from "react-native";
import type { ColorValue } from "react-native";

type PullRefreshOptions = {
  refreshing: boolean;
  onRefresh: () => void;
  color: ColorValue;
};

/**
 * Build a RefreshControl without JSX.
 * NativeWind's jsx runtime crashes on <RefreshControl /> ("Property 'RefreshControl' doesn't exist").
 */
export function pullRefreshControl({ refreshing, onRefresh, color }: PullRefreshOptions) {
  const Control = ReactNative.RefreshControl;
  if (typeof Control !== "function" && typeof Control !== "object") {
    return undefined;
  }
  return createElement(Control, {
    refreshing,
    onRefresh,
    tintColor: color,
    colors: [String(color)],
  });
}

export function usePullToRefresh(reload: () => Promise<unknown> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.resolve(reload()).finally(() => {
      setRefreshing(false);
    });
  }, [reload]);

  return { refreshing, onRefresh };
}
