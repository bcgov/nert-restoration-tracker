import ProjectsLayout from "../../features/projects/ProjectsLayout";
import React from "react";
import { Navigate, Routes } from "react-router";
import AppRoute from "../../utils/AppRoute";
import MyProjectsPage from "./MyProjectsPlansListPage";

/**
 * Router for all user specific pages.
 *
 * @param {*} props
 * @return {*}
 */
const UserRouter: React.FC = () => {
  return (
    <Routes>
      <Navigate to="/admin/user/projects" replace />

      <AppRoute path="/admin/user/projects" layout={ProjectsLayout}>
        <ProjectsLayout>
          <MyProjectsPage />
        </ProjectsLayout>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/user/projects/*">
        <Navigate to="/page-not-found" replace />
      </AppRoute>
    </Routes>
  );
};

export default UserRouter;
