import { UnAuthGuard } from 'components/security/Guards';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import PublicProjectPlanView from 'pages/public/PublicProjectPlanView';
import PublicProjectsPlansListPage from 'pages/public/PublicProjectsPlansListPage';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectURL } from 'utils/AppRoutesUtils';

/**
 * Router for all `/projects/*` pages.
 *
 * @return {*}
 */
const PublicProjectsRouter: React.FC = () => {
  return (
    <Routes>
      <Route path=":id" element={<RedirectURL basePath="/projects" />} />
      <Route element={<ProjectsLayout />}>
        <Route path="/" element={<PublicProjectsPlansListPage />} />
        <Route
          path=":id/details"
          element={
            <UnAuthGuard fallback={<Navigate replace to={`/admin/projects`} />}>
              <PublicProjectPlanView />
            </UnAuthGuard>
          }
        />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default PublicProjectsRouter;
