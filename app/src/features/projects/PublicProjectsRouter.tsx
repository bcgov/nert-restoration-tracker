import { NoRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
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
            <NoRoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[
                PROJECT_ROLE.PROJECT_LEAD,
                PROJECT_ROLE.PROJECT_EDITOR,
                PROJECT_ROLE.PROJECT_VIEWER
              ]}
              fallback={(projectId) => <Navigate replace to={`/admin/projects/${projectId}`} />}>
              <PublicProjectPlanView />
            </NoRoleGuard>
          }
        />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default PublicProjectsRouter;
