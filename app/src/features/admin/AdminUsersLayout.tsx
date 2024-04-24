import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout for all admin/users pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersLayout: React.FC = () => {
  return <Outlet />;
};

export default AdminUsersLayout;
