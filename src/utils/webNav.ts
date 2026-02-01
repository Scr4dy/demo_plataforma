type TabListener = (tab: string, params?: any) => void;
let tabListeners: TabListener[] = [];

type Route = { name: string; params?: any };
type RouteListener = (route: Route | null) => void;
let routeListeners: RouteListener[] = [];

let currentRoute: Route | null = null;

let routeHistory: Route[] = [];

export function onWebTabChange(fn: TabListener) {
  tabListeners.push(fn);
  return () => {
    tabListeners = tabListeners.filter(l => l !== fn);
  };
}

export function goToWebTab(tab: string, params?: any) {
  
  routeHistory = [];
  currentRoute = null;

  tabListeners.forEach(fn => {
    try { fn(tab, params); } catch (e) {  }
  });
}

export function onWebRouteChange(fn: RouteListener) {
  routeListeners.push(fn);
  return () => {
    routeListeners = routeListeners.filter(l => l !== fn);
  };
}

export function goToWebRoute(name: string, params?: any) {
  const route: Route = { name, params };

  
  if (currentRoute) {
    routeHistory.push(currentRoute);
  }

  currentRoute = route;
  routeListeners.forEach(fn => {
    try { fn(route); } catch (e) {  }
  });
}

export function clearWebRoute() {
  currentRoute = null;
  routeListeners.forEach(fn => {
    try { fn(null); } catch (e) {  }
  });
}

export function goBackWebRoute() {
  
  const previousRoute = routeHistory.pop();

  if (previousRoute) {
    
    currentRoute = previousRoute;
    routeListeners.forEach(fn => {
      try { fn(previousRoute); } catch (e) {  }
    });
    return true;
  }

  
  clearWebRoute();
  return false;
}

export function getCurrentWebRoute() {
  return currentRoute;
}

export function hasWebRouteHistory() {
  return routeHistory.length > 0;
}
