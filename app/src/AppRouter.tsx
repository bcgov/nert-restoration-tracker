import { SystemRoleGuard } from 'components/security/Guards';
import { AuthenticatedRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import PublicProjectsRouter from 'features/projects/PublicProjectsRouter';
import SearchPage from 'features/search/SearchPage';
import UserRouter from 'features/user/UserRouter';
import PublicLayout from 'layouts/PublicLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import LogOutPage from 'pages/logout/LogOutPage';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const AppRouter: React.FC = () => {
  const location = useLocation();

  const postfixTitle = (path: string) => {
    return (
      {
        '/search': 'Search',
        '/admin/Search': 'Search',
        '/projects': 'All Projects/All Plans',
        '/admin/projects': 'All Projects/All Plans',
        '/page-not-found': 'Page Not Found',
        '/forbidden': 'Forbidden',
        '/access-request': 'Access Request',
        '/request-submitted': 'Request Submitted',
        '/logout': 'Logout',
        '/admin/user': 'My Projects/My Plans',
        '/admin/users': 'Users'
      }[path] ?? null
    );
  };

  const getTitle = (path: string) => {
    const title = 'Northeast Restoration Tracker';
    const postfix = postfixTitle(path);
    if (path) return postfix ? title + ' - ' + postfix : title;
    else return title;
  };

  useEffect(() => {
    document.title = getTitle(location.pathname) ?? getTitle('');
  }, [location]);

  return (
    <Routes>
      <Route
        path="/:url*(/+)"
        element={
          <Navigate replace to={{ ...location, pathname: location.pathname.slice(0, -1) }} />
        }
      />

      <Route path="/" element={<Navigate replace to="/search" />} />
      <Route path="/admin" element={<Navigate replace to="/admin/search" />} />

      <Route element={<PublicLayout />}>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/projects/*" element={<PublicProjectsRouter />} />
        <Route path="/page-not-found" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<AccessDenied />} />
        <Route
          path="/access-request"
          element={
            <AuthenticatedRouteGuard>
              <AccessRequestPage />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/request-submitted"
          element={
            <AuthenticatedRouteGuard>
              <RequestSubmitted />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/logout"
          element={
            <AuthenticatedRouteGuard>
              <LogOutPage />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/admin/search"
          element={
            <AuthenticatedRouteGuard>
              <SearchPage />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/admin/projects/*"
          element={
            <AuthenticatedRouteGuard>
              <ProjectsRouter />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/admin/user/*"
          element={
            <AuthenticatedRouteGuard>
              <UserRouter />
            </AuthenticatedRouteGuard>
          }
        />
        <Route
          path="/admin/users/*"
          element={
            <AuthenticatedRouteGuard>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <AdminUsersRouter />
              </SystemRoleGuard>
            </AuthenticatedRouteGuard>
          }
        />
      </Route>

      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default AppRouter;
