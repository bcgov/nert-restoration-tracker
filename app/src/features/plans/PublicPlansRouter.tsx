import ProjectsLayout from 'layouts/ProjectsLayout';
import PublicProjectPlanView from 'pages/public/PublicProjectPlanView';
import PublicProjectsPlansListPage from 'pages/public/PublicProjectsPlansListPage';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RedirectURL } from 'utils/AppRoutesUtils';

/**
 * Router for all `/plans/*` pages.
 *
 * @return {*}
 */
const PublicPlansRouter: React.FC = () => {
  return (
    <Routes>
      <Route path=":id" element={<RedirectURL basePath="/plans" />} />
      <Route element={<ProjectsLayout />}>
        <Route path="/" element={<PublicProjectsPlansListPage />} />
        <Route path=":id/details" element={<PublicProjectPlanView />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default PublicPlansRouter;
