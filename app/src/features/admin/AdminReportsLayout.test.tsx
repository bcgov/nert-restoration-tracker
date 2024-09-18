import { render } from '@testing-library/react';
import React from 'react';
import AdminReportsLayout from './AdminReportsLayout';

describe('AdminReportsLayout', () => {
  it.skip('renders correctly', () => {
    const { getByText } = render(
      <AdminReportsLayout>
        <p>This is the admin reports layout test child component</p>
      </AdminReportsLayout>
    );

    expect(getByText('This is the admin reports layout test child component')).toBeVisible();
  });
});
