import { RoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectURL } from 'utils/AppRoutesUtils';
import ProjectsPlansListPage from '../projects/ProjectsPlansListPage';
import CreatePlanPage from './create/CreatePlanPage';
import ViewPlanPage from './view/ViewPlanPage';
import EditPlanPage from './edit/EditProjectPage';
import ProjectParticipantsPage from 'features/projects/participants/ProjectParticipantsPage';

/**
 * Router for all `/admin/plans/*` pages.
 *
 * @return {*}
 */
const PlansRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProjectsLayout />}>
        <Route path="/" element={<ProjectsPlansListPage />} />
        <Route path=":id" element={<RedirectURL basePath="/admin/plans" />} />
        <Route
          path="/create"
          element={
            <SystemRoleGuard
              validSystemRoles={[
                SYSTEM_ROLE.SYSTEM_ADMIN,
                SYSTEM_ROLE.DATA_ADMINISTRATOR,
                SYSTEM_ROLE.PROJECT_CREATOR
              ]}
              fallback={<Navigate replace to={'/plans'} />}>
              <CreatePlanPage />
            </SystemRoleGuard>
          }
        />

        <Route
          path=":id/edit"
          element={
            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              fallback={(projectId) => (
                <Route path="" element={<Navigate replace to={`/plans/${projectId}`} />} />
              )}>
              <EditPlanPage />
            </RoleGuard>
          }
        />
        <Route
          path=":id/details"
          element={
            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[
                PROJECT_ROLE.PROJECT_LEAD,
                PROJECT_ROLE.PROJECT_EDITOR,
                PROJECT_ROLE.PROJECT_VIEWER
              ]}
              fallback={(projectId) => <Navigate replace to={`/plans/${projectId}`} />}>
              <ViewPlanPage />
            </RoleGuard>
          }
        />
        <Route
          path=":id/users"
          element={
            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              fallback={(projectId) => <Navigate replace to={`/plans/${projectId}`} />}>
              <ProjectParticipantsPage />
            </RoleGuard>
          }
        />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default PlansRouter;
