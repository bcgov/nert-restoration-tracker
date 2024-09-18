import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminReportsLayout from './AdminReportsLayout';
import ReportsPage from './reports/ReportsPage';

/**
 * Router for all `/admin/reports/*` pages.
 *
 * @return {*}
 */
const AdminReportsRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminReportsLayout />}>
        <Route path="/" element={<ReportsPage />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default AdminReportsRouter;
