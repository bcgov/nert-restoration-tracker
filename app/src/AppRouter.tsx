import { SystemRoleGuard } from 'components/security/Guards';
import { AuthenticatedRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import PlansRouter from 'features/plans/PlansRouter';
import PublicPlansRouter from 'features/plans/PublicPlansRouter';
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
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';

export const AppRouter = () => {
  return createBrowserRouter(
    createRoutesFromElements(
      <>
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
          <Route path="/plans/*" element={<PublicPlansRouter />} />
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
            path="/admin/plans/*"
            element={
              <AuthenticatedRouteGuard>
                <PlansRouter />
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
      </>
    )
  );
};
