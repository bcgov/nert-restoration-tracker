import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
import ActiveUsersList, { IActiveUsersListProps } from './ActiveUsersList';

jest.mock('../../../hooks/useNertApi');

const renderContainer = (props: IActiveUsersListProps) => {
  const routes = [{ path: '/123', element: <ActiveUsersList {...props} /> }];

  const router = createMemoryRouter(routes, { initialEntries: ['/123'] });

  return render(
    <RouterProvider router={router}>
      <ActiveUsersList {...props} />
    </RouterProvider>
  );
};

describe('ActiveUsersList', () => {
  it('shows `No Active Users` when there are no active users', async () => {
    const mockGetUsers = jest.fn();
    const { getByText } = renderContainer({
      activeUsers: [],
      codes: codes,
      getUsers: mockGetUsers
    });

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('shows a table row for an active user with all fields having values', async () => {
    const { getByText } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          record_end_date: '2020-10-10',
          role_names: ['role 1', 'role 2'],
          project_id: 1,
          name: 'name',
          system_user_id: 1,
          project_role_id: 1,
          project_role_name: 'project role name',
          project_participation_id: 1,
          role_ids: ['1', '2'],
          projects: []
        }
      ],
      codes: codes,
      refresh: jest.fn()
    });

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1, role 2')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          record_end_date: '2020-10-10',
          role_names: [],
          project_id: 1,
          name: 'name',
          system_user_id: 1,
          project_role_id: 1,
          project_role_name: 'project role name',
          project_participation_id: 1,
          role_ids: ['1', '2'],
          projects: []
        }
      ],
      codes: codes,
      refresh: jest.fn()
    });

    await waitFor(() => {
      expect(getByTestId('custom-menu-button-Unassigned')).toBeInTheDocument();
    });
  });

  it('renders the add new users button correctly', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          record_end_date: '2020-10-10',
          role_names: ['role 1', 'role 2'],
          project_id: 1,
          name: 'name',
          system_user_id: 1,
          project_role_id: 1,
          project_role_name: 'project role name',
          project_participation_id: 1,
          role_ids: ['1', '2'],
          projects: []
        }
      ],
      codes: codes,
      refresh: jest.fn()
    });

    await waitFor(() => {
      expect(getByTestId('invite-system-users-button')).toBeVisible();
    });
  });
});
