import { useCallback } from "react";
import {
  CommonActions,
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import {
  resolvePath,
  pathsByScreen,
  type DestinationState,
  type RouteParams,
} from "./routes";
// Preserve component-level callbacks while all state and history belong to React Navigation.
export function useNavigate() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  return useCallback(
    (
      path: string | number,
      options?: { state?: DestinationState; replace?: boolean },
    ) => {
      if (typeof path === "number") {
        if (navigation.canGoBack()) navigation.goBack();
        else {
          let root = navigation;
          while (root.getParent()) root = root.getParent()!;
          const names = root.getState().routeNames;
          if (names.includes("Main"))
            root.dispatch(
              CommonActions.navigate({
                name: "Main",
                params: { screen: "HomeTab" },
              }),
            );
          else if (names.includes("AuthFlow"))
            root.dispatch(
              CommonActions.navigate({
                name: "AuthFlow",
                params: { screen: "Onboarding" },
              }),
            );
        }
        return;
      }
      const destination = resolvePath(path, options?.state);
      let root = navigation;
      while (root.getParent()) root = root.getParent()!;
      const available = root.getState().routeNames;
      if (destination.tab) {
        if (!available.includes("Main")) {
          if (available.includes("AuthFlow"))
            root.dispatch(
              CommonActions.navigate({
                name: "AuthFlow",
                params: { screen: "Auth" },
              }),
            );
          return;
        }
        root.dispatch(
          CommonActions.navigate({
            name: "Main",
            params: {
              screen: destination.tab,
              params: { screen: destination.name, params: destination.params },
              initial: false,
            },
          }),
        );
        return;
      }
      if (destination.name === "Onboarding" && available.includes("Main")) {
        root.dispatch(
          CommonActions.navigate({
            name: "Main",
            params: { screen: "HomeTab" },
          }),
        );
        return;
      }
      if (
        available.includes("AuthFlow") &&
        ["Auth", "Onboarding"].includes(destination.name)
      ) {
        root.dispatch(
          CommonActions.navigate({
            name: "AuthFlow",
            params: { screen: destination.name },
          }),
        );
        return;
      }
      if (available.includes(destination.name))
        root.dispatch(
          CommonActions.navigate({
            name: destination.name,
            params: destination.params,
          }),
        );
    },
    [navigation],
  );
}
export function useLocation() {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  return {
    state: params?.state,
    pathname:
      pathsByScreen[route.name] ??
      (params?.id
        ? `/outfit/${params.id}`
        : params?.username
          ? `/u/${params.username}`
          : "/unknown"),
  };
}
export function useParams<T extends Record<string, string | undefined>>() {
  return (useRoute().params ?? {}) as T;
}
