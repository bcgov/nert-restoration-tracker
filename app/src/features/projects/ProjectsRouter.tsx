import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import EditProjectPage from 'features/projects/edit/EditProjectPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ViewProjectPage from 'features/projects/view/ViewProjectPage';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectURL } from 'utils/AppRoutesUtils';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';
import ProjectsPlansListPage from './ProjectsPlansListPage';

/**
 * Router for all `/admin/project/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProjectsLayout />}>
        <Route path="/" element={<ProjectsPlansListPage />} />
        <Route path=":id" element={<RedirectURL basePath="/admin/projects" />} />
        <Route
          path="/create"
          element={
            <SystemRoleGuard
              validSystemRoles={[
                SYSTEM_ROLE.SYSTEM_ADMIN,
                SYSTEM_ROLE.DATA_ADMINISTRATOR,
                SYSTEM_ROLE.PROJECT_CREATOR
              ]}
              fallback={<Navigate replace to={'/projects'} />}>
              <CreateProjectPage />
            </SystemRoleGuard>
          }
        />
        <Route
          path=":id/edit"
          element={
            <ProjectRoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              validProjectPermissions={[]}
              fallback={<Route path="" element={<Navigate replace to={`/projects`} />} />}>
              <EditProjectPage />
            </ProjectRoleGuard>
          }
        />
        <Route
          path=":id/details"
          element={
            <ProjectRoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[
                PROJECT_ROLE.PROJECT_LEAD,
                PROJECT_ROLE.PROJECT_EDITOR,
                PROJECT_ROLE.PROJECT_VIEWER
              ]}
              validProjectPermissions={[]}
              fallback={<Navigate replace to={`/projects`} />}>
              <ViewProjectPage />
            </ProjectRoleGuard>
          }
        />
        <Route
          path=":id/users"
          element={
            <ProjectRoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              validProjectPermissions={[]}
              fallback={<Navigate replace to={`/projects`} />}>
              <ProjectParticipantsPage />
            </ProjectRoleGuard>
          }
        />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default ProjectsRouter;
