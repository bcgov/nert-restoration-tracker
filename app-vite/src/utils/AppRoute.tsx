import React from "react";
import { Route, useLocation } from "react-router-dom";

export type IAppRouteProps = {
  path: string;
  element: React.ReactElement;
  title?: string;
  layout?: React.ComponentType<any>;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  element,
  layout,
  title,
  ...rest
}) => {
  const Layout = layout === undefined ? React.Fragment : layout;
  const location = useLocation();

  if (title) {
    document.title = title;
  }

  return (
    <Route
      {...rest}
      element={
        <Layout>{React.cloneElement(element, { key: location.key })}</Layout>
      }
    />
  );
};

export default AppRoute;
