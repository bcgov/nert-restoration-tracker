import { CircularProgress } from '@mui/material';
import { AuthenticatedRouteGuard, SystemRoleRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import AdminReportsRouter from 'features/admin/AdminReportsRouter';
import AdminUsersRouter from 'features/admin/AdminUsersRouter';
import PlansRouter from 'features/plans/PlansRouter';
import PublicPlansRouter from 'features/plans/PublicPlansRouter';
import ProjectsRouter from 'features/projects/ProjectsRouter';
import PublicProjectsRouter from 'features/projects/PublicProjectsRouter';
import SearchPage from 'features/search/SearchPage';
import UserRouter from 'features/user/UserRouter';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import AppLayout from 'layouts/AppLayout';
import RequestSubmitted from 'pages/200/RequestSubmitted';
import AccessDenied from 'pages/403/AccessDenied';
import NotFoundPage from 'pages/404/NotFoundPage';
import AccessRequestPage from 'pages/access/AccessRequestPage';
import LogOutPage from 'pages/logout/LogOutPage';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

export const AppRouter = () => {
  const authStateContext = useAuthStateContext();

  if (!authStateContext.auth) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

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

      {/* User Routes */}
      <Route element={<AppLayout />}>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/projects/*" element={<PublicProjectsRouter />} />
        <Route path="/plans/*" element={<PublicPlansRouter />} />
        <Route path="/page-not-found" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<AccessDenied />} />
        <Route path="/access-request" element={<AccessRequestPage />} />
        <Route path="/request-submitted" element={<RequestSubmitted />} />
        <Route path="/logout" element={<LogOutPage />} />

        {/* System Role Routes */}
        <Route path="/admin" element={<AuthenticatedRouteGuard />}>
          <Route index element={<SearchPage />} />
          <Route path="/admin/search" element={<SearchPage />} />
          <Route path="/admin/projects/*" element={<ProjectsRouter />} />
          <Route path="/admin/plans/*" element={<PlansRouter />} />
          <Route path="/admin/user/*" element={<UserRouter />} />

          {/* Admin Routes */}
          <Route element={<SystemRoleRouteGuard validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]} />}>
            <Route path="/admin/users/*" element={<AdminUsersRouter />} />
          </Route>

          {/* Admin/Maintainer Route */}
          <Route
            element={
              <SystemRoleRouteGuard
                validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
              />
            }>
            <Route path="/admin/reports/*" element={<AdminReportsRouter />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};
