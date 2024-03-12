import { RoleGuard, SystemRoleGuard } from "../../components/security/Guards";
import { PROJECT_ROLE, SYSTEM_ROLE } from "../../constants/roles";
import EditProjectPage from "../../features/edit/EditProjectPage";
import CreateProjectPage from "../../features/projects/create/CreateProjectPage";
import ProjectsLayout from "../../features/projects/ProjectsLayout";
import ViewProjectPage from "../../features/projects/view/ViewProjectPage";
import React from "react";
import { Navigate, Routes } from "react-router";
import AppRoute from "../../utils/AppRoute";
import ProjectParticipantsPage from "./participants/ProjectParticipantsPage";
import ProjectsPage from "./ProjectsPlansListPage";

/**
 * Router for all `/admin/project/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Routes>
      <AppRoute path="/admin/projects" layout={ProjectsLayout}>
        <ProjectsPage />
      </AppRoute>

      <AppRoute path="/admin/projects/create" layout={ProjectsLayout}>
        <SystemRoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
            SYSTEM_ROLE.PROJECT_CREATOR,
          ]}
          fallback={<Navigate replace to={"/projects"} />}
        >
          <CreateProjectPage />
        </SystemRoleGuard>
      </AppRoute>

      <AppRoute path="/admin/projects/:id/edit" layout={ProjectsLayout}>
        <RoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
          ]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
          ]}
          fallback={(projectId) => (
            <Navigate to={`/projects/${projectId}`} replace />
          )}
        >
          <EditProjectPage />
        </RoleGuard>
      </AppRoute>

      <Navigate to="/admin/projects/:id/details" replace />

      <AppRoute path="/admin/projects/:id/details" layout={ProjectsLayout}>
        <RoleGuard
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
            <Navigate to={`/projects/${projectId}`} replace />
          )}
        >
          <ViewProjectPage />
        </RoleGuard>
      </AppRoute>

      <AppRoute path="/admin/projects/:id/users" layout={ProjectsLayout}>
        <RoleGuard
          validSystemRoles={[
            SYSTEM_ROLE.SYSTEM_ADMIN,
            SYSTEM_ROLE.DATA_ADMINISTRATOR,
          ]}
          validProjectRoles={[
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_EDITOR,
          ]}
          fallback={(projectId) => (
            <Navigate to={`/projects/${projectId}`} replace />
          )}
        >
          <ProjectParticipantsPage />
        </RoleGuard>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Navigate to="/page-not-found" replace />
      </AppRoute>
    </Routes>
  );
};

export default ProjectsRouter;
