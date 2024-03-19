import { NoRoleGuard } from "../../components/security/Guards";
import { PROJECT_ROLE, SYSTEM_ROLE } from "../../constants/roles";
import ProjectsLayout from "../../features/projects/ProjectsLayout";
import PublicProjectPage from "../../pages/public/PublicProjectPage";
import PublicProjectsListPage from "../../pages/public/PublicProjectsPlansListPage";
import React from "react";
import { Navigate, Routes } from "react-router";
import AppRoute from "../../utils/AppRoute";

/**
 * Router for all `/projects/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PublicProjectsRouter: React.FC = () => {
  return (
    <Routes>
      <AppRoute path="/projects">
        <PublicProjectsListPage />
      </AppRoute>

      <Navigate to="/projects/:id/details" replace />

      <AppRoute path="/projects/:id/details">
        {/* Catches Logged in users and redirects them to admin page */}
        <NoRoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
          ]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
            PROJECT_ROLE.PROJECT_VIEWER,
          ]}
          fallback={(projectId) => (
            <Navigate to={`/admin/projects/${projectId}`} replace />
          )}
        >
          <ProjectsLayout>
            <PublicProjectPage />
          </ProjectsLayout>
        </NoRoleGuard>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/projects/*">
        <Navigate to="/page-not-found" replace />
      </AppRoute>
    </Routes>
  );
};

export default PublicProjectsRouter;
