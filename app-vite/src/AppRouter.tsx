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
import { Routes, Route, useLocation } from "react-router-dom";
import { Navigate } from "react-router";
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
      {/* Not sure if I need this. */}
      <Route path="/" element={<Navigate to="/" />} />

      {/* Redirect to admin search if user is authenticated */}
      {authenticated ? (
        <Route path="/admin/search" />
      ) : (
        <Route path="/search" />
      )}
      {authenticated && <Route path="/admin/search" />}

      <Route
        path="/projects"
        // title={getTitle("All Projects/All Plans")}
        // layout={PublicLayout}
        element={<PublicProjectsRouter />}
      />

      {/* <AppRoute
        path="/search"
        title={getTitle("Search")}
        layout={PublicLayout}
        element={
          <UnAuthGuard>
            <SearchPage />
          </UnAuthGuard>
        }
      />

      <AppRoute
        path="/page-not-found"
        title={getTitle("Page Not Found")}
        layout={PublicLayout}
        element={<NotFoundPage />}
      />

      <AppRoute
        path="/forbidden"
        title={getTitle("Forbidden")}
        layout={PublicLayout}
        element={<AccessDenied />}
      />

      <AppRoute
        path="/access-request"
        title={getTitle("Access Request")}
        layout={PublicLayout}
        element={
          <UnAuthGuard>
            <AccessRequestPage />
          </UnAuthGuard>
        }
      />

      <AppRoute
        path="/request-submitted"
        title={getTitle("Request submitted")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <RequestSubmitted />
          </AuthenticatedRouteGuard>
        }
      />

      <Route path="/admin/search" />

      <AppRoute
        path="/admin/projects"
        title={getTitle("All Projects/All Plans")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <ProjectsRouter />
          </AuthenticatedRouteGuard>
        }
      />

      <AppRoute
        path="/admin/user"
        title={getTitle("My Projects/My Plans")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <UserRouter />
          </AuthenticatedRouteGuard>
        }
      />

      <AppRoute
        path="/admin/users"
        title={getTitle("Users")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
              <AdminUsersRouter />
            </SystemRoleGuard>
          </AuthenticatedRouteGuard>
        }
      />

      <AppRoute
        path="/admin/search"
        title={getTitle("Search")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <SearchPage />
          </AuthenticatedRouteGuard>
        }
      />

      <AppRoute
        path="/logout"
        title={getTitle("Logout")}
        layout={PublicLayout}
        element={
          <AuthenticatedRouteGuard>
            <LogOutPage />
          </AuthenticatedRouteGuard>
        }
      />

      <AppRoute title="*" path="*" element={<Route path="/page-not-found" />} /> */}
    </Routes>
  );
};

export default AppRouter;
