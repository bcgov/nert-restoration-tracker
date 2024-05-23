import AdminUsersLayout from 'features/admin/AdminUsersLayout';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';

/**
 * Router for all `/admin/users/*` pages.
 *
 * @return {*}
 */
const AdminUsersRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminUsersLayout />}>
        <Route path="/" element={<ManageUsersPage />} />
        <Route path="/:id" element={<UsersDetailPage />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default AdminUsersRouter;
