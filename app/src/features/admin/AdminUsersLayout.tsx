import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout for all admin/users pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminUsersLayout = (props: any) => {
  return <Outlet />;
};

export default AdminUsersLayout;
