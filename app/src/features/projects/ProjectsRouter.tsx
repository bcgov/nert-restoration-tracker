import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import EditProjectPage from 'features/projects/edit/EditProjectPage';
import ViewProjectPage from 'features/projects/view/ViewProjectPage';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';
import ProjectsPlansListPage from './ProjectsPlansListPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import { RedirectURL } from 'utils/AppRoutesUtils';
import { ProjectAuthStateContextProvider } from 'contexts/projectAuthStateContext';
import { ProjectRoleGuard } from 'components/security/Guards';

/**
 * Router for all `/admin/project/*` pages.
 *
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProjectsLayout />}>
        {/*  Redirect any unknown routes to the projects page */}
        <Route path="/" element={<ProjectsPlansListPage />} />
        <Route path=":id" element={<RedirectURL basePath="/admin/projects" />} />
        {/* Create */}
        <Route path="/create" element={<CreateProjectPage />} />

        {/* Edit */}
        <Route
          path=":id/edit"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
                <EditProjectPage />
              </ProjectRoleGuard>
            </ProjectAuthStateContextProvider>
          }
        />

        {/* View */}
        <Route path=":id" element={<Navigate replace to=":id/details" />} />
        <Route
          path=":id/details"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[
                  SYSTEM_ROLE.SYSTEM_ADMIN,
                  SYSTEM_ROLE.MAINTAINER,
                  SYSTEM_ROLE.PROJECT_CREATOR
                ]}
                validProjectRoles={[
                  PROJECT_ROLE.PROJECT_LEAD,
                  PROJECT_ROLE.PROJECT_EDITOR,
                  PROJECT_ROLE.PROJECT_VIEWER
                ]}>
                <ViewProjectPage />
              </ProjectRoleGuard>
            </ProjectAuthStateContextProvider>
          }
        />

        {/* Participants */}
        <Route
          path=":id/users"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
                <ProjectParticipantsPage />
              </ProjectRoleGuard>
            </ProjectAuthStateContextProvider>
          }
        />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default ProjectsRouter;
