import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout for all admin/users pages.
 *
 * @param {*} props
 * @return {*}
 */
const AdminReportsLayout = (props: any) => {
  return <Outlet />;
};

export default AdminReportsLayout;
