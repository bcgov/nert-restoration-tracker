import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminReportsLayout from './AdminReportsLayout';
import ReportsPage from './reports/ReportsPage';
import AppUserReportPage from './reports/AppUserReportPage';
import AppCustomReportPage from './reports/AppCustomReportPage';
import AppPiMgmtReportPage from './reports/AppPiMgmtReportPage';

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
        <Route path="/user" element={<AppUserReportPage />} />
        <Route path="/custom" element={<AppCustomReportPage />} />
        <Route path="/pimgmt" element={<AppPiMgmtReportPage />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default AdminReportsRouter;
