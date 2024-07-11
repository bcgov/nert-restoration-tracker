import AdminUsersLayout from 'features/admin/AdminUsersLayout';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ManageUsersPage from './users/ManageUsersPage';
import UsersDetailPage from './users/UsersDetailPage';
import { RedirectURL } from 'utils/AppRoutesUtils';

/**
 * Router for all `/admin/users/*` pages.
 *
 * @return {*}
 */
const AdminUsersRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<AdminUsersLayout />}>
        <Route index element={<ManageUsersPage />} />
        <Route path=":id" element={<RedirectURL basePath="/admin/users" />} />
        <Route path=":id" element={<Navigate replace to=":id/details" />} />
        <Route path=":id/details" element={<UsersDetailPage />} />
      </Route>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <Route path="/*" element={<Navigate replace to="/page-not-found" />} />
    </Routes>
  );
};

export default AdminUsersRouter;
