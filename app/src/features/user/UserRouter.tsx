import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MyProjectsPlansListPage from './MyProjectsPlansListPage';
import ProjectsLayout from 'layouts/ProjectsLayout';

/**
 * Router for all user specific pages.
 *
 * @return {*}
 */
const UserRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/admin/user/projects" />} />

      <Route element={<ProjectsLayout />}>
        <Route path="/projects" element={<MyProjectsPlansListPage />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default UserRouter;
