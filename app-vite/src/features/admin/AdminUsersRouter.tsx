import AdminUsersLayout from "../../features/admin/AdminUsersLayout";
import React from "react";
import { Navigate, Routes } from "react-router";
import AppRoute from "../../utils/AppRoute";
import ManageUsersPage from "./users/ManageUsersPage";
import UsersDetailPage from "./users/UsersDetailPage";

/**
 * Router for all `/admin/users/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersRouter: React.FC = () => {
  return (
    <Routes>
      <AppRoute path="/admin/users" layout={AdminUsersLayout}>
        <ManageUsersPage />
      </AppRoute>

      <AppRoute path="/admin/users/:id" layout={AdminUsersLayout}>
        <UsersDetailPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/users/*">
        <Navigate replace to="/page-not-found" />
      </AppRoute>
    </Routes>
  );
};

export default AdminUsersRouter;
