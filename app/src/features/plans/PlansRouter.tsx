import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProjectsPlansListPage from '../projects/ProjectsPlansListPage';
import CreatePlanPage from './create/CreatePlanPage';
import EditPlanPage from './edit/EditPlanPage';
import ViewPlanPage from './view/ViewPlanPage';
import PlanParticipantsPage from './participants/PlanParticipantsPage';
import ProjectsLayout from 'layouts/ProjectsLayout';
import { RedirectURL } from 'utils/AppRoutesUtils';
import { ProjectAuthStateContextProvider } from 'contexts/projectAuthStateContext';
import PublicProjectPlanView from 'pages/public/PublicProjectPlanView';

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
        <Route path="/create" element={<CreatePlanPage />} />

        <Route
          path=":id/edit"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
                fallback={<Route path="" element={<Navigate replace to={`/plans`} />} />}>
                <EditPlanPage />
              </ProjectRoleGuard>
            </ProjectAuthStateContextProvider>
          }
        />
        <Route
          path=":id/details"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
                validProjectRoles={[
                  PROJECT_ROLE.PROJECT_LEAD,
                  PROJECT_ROLE.PROJECT_EDITOR,
                  PROJECT_ROLE.PROJECT_VIEWER
                ]}
                fallback={<PublicProjectPlanView />}>
                <ViewPlanPage />
              </ProjectRoleGuard>
            </ProjectAuthStateContextProvider>
          }
        />
        <Route
          path=":id/users"
          element={
            <ProjectAuthStateContextProvider>
              <ProjectRoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
                fallback={<Navigate replace to={`/plans`} />}>
                <PlanParticipantsPage />
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

export default PlansRouter;
