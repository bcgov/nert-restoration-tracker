import { SystemRoleGuard, UnAuthGuard } from "./components/security/Guards";
import { AuthenticatedRouteGuard } from "./components/security/RouteGuards";
import { SYSTEM_ROLE } from "./constants/roles";
import { AuthStateContext } from "./contexts/authStateContext";
import AdminUsersRouter from "./features/admin/AdminUsersRouter";
import ProjectsRouter from "./features/projects/ProjectsRouter";
import PublicProjectsRouter from "./features/projects/PublicProjectsRouter";
import SearchPage from "./features/search/SearchPage";
import UserRouter from "./features/user/UserRouter";
import PublicLayout from "./layouts/PublicLayout";
import RequestSubmitted from "./pages/200/RequestSubmitted";
import AccessDenied from "./pages/403/AccessDenied";
import NotFoundPage from "./pages/404/NotFoundPage";
import AccessRequestPage from "./pages/access/AccessRequestPage";
import LogOutPage from "./pages/logout/LogOutPage";
import React, { useContext } from "react";
import { Redirect, Routes, useLocation } from "react-router-dom";
import AppRoute from "./utils/AppRoute";

const AppRouter: React.FC = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const location = useLocation();

  const getTitle = (page: string) => {
    return `Northeast Restoration Tracker - ${page}`;
  };

  const authenticated = keycloakWrapper?.keycloak.authenticated;

  return (
    <Routes>
      <Redirect
        from="/:url*(/+)"
        to={{ ...location, pathname: location.pathname.slice(0, -1) }}
      />

      {/* Redirect to admin search if user is authenticated */}
      {authenticated ? (
        <Redirect exact from="/" to="/admin/search" />
      ) : (
        <Redirect exact from="/" to="/search" />
      )}
      {authenticated && <Redirect exact from="/search" to="/admin/search" />}

      <AppRoute
        path="/projects"
        title={getTitle("All Projects/All Plans")}
        layout={PublicLayout}
      >
        <PublicProjectsRouter />
      </AppRoute>

      <AppRoute path="/search" title={getTitle("Search")} layout={PublicLayout}>
        <UnAuthGuard>
          <SearchPage />
        </UnAuthGuard>
      </AppRoute>

      <AppRoute
        path="/page-not-found"
        title={getTitle("Page Not Found")}
        layout={PublicLayout}
      >
        <NotFoundPage />
      </AppRoute>

      <AppRoute
        path="/forbidden"
        title={getTitle("Forbidden")}
        layout={PublicLayout}
      >
        <AccessDenied />
      </AppRoute>

      <AppRoute
        path="/access-request"
        title={getTitle("Access Request")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <AccessRequestPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute
        path="/request-submitted"
        title={getTitle("Request submitted")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <RequestSubmitted />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <Redirect exact from="/admin" to="/admin/search" />

      <AppRoute
        path="/admin/projects"
        title={getTitle("All Projects/All Plans")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <ProjectsRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute
        path="/admin/user"
        title={getTitle("My Projects/My Plans")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <UserRouter />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute
        path="/admin/users"
        title={getTitle("Users")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <AdminUsersRouter />
          </SystemRoleGuard>
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute
        path="/admin/search"
        title={getTitle("Search")}
        layout={PublicLayout}
      >
        <AuthenticatedRouteGuard>
          <SearchPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute path="/logout" title={getTitle("Logout")} layout={PublicLayout}>
        <AuthenticatedRouteGuard>
          <LogOutPage />
        </AuthenticatedRouteGuard>
      </AppRoute>

      <AppRoute title="*" path="*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Routes>
  );
};

export default AppRouter;
