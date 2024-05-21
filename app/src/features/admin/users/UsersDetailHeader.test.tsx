import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import UsersDetailHeader from './UsersDetailHeader';

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
const mockUseApi = {
  user: {
    deleteSystemUser: jest.fn<Promise<number>, []>()
  }
};

const mockUser = {
  id: 1,
  user_identifier: 'testUser',
  record_end_date: 'ending',
  role_names: ['system']
} as unknown as IGetUserResponse;

describe('UsersDetailHeader', () => {
  beforeEach(() => {
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly when selectedUser are loaded', async () => {
    const routes = [
      { path: '/admin/users/1', element: <UsersDetailHeader userDetails={mockUser} /> },
      { path: '/admin/users', element: <div>Manage Users</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

    const { getAllByTestId } = render(
      <RouterProvider router={router}>
        <UsersDetailHeader userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
      expect(getAllByTestId('remove-user-button').length).toEqual(1);
    });
  });

  it('breadcrumbs link routes user correctly', async () => {
    const routes = [
      { path: '/admin/users/1', element: <UsersDetailHeader userDetails={mockUser} /> },
      { path: '/admin/users', element: <div>Manage Users</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

    const { getAllByTestId, getByText } = render(
      <RouterProvider router={router}>
        <UsersDetailHeader userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
    });

    fireEvent.click(getByText('Manage Users'));

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/admin/users');
    });
  });

  describe('Are you sure? Dialog', () => {
    it('Remove User button opens dialog', async () => {
      const routes = [
        { path: '/admin/users/1', element: <UsersDetailHeader userDetails={mockUser} /> },
        { path: '/admin/users', element: <div>Manage Users</div> }
      ];

      const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailHeader userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });
    });

    it('does nothing if the user clicks `Cancel` or away from the dialog', async () => {
      const routes = [
        { path: '/admin/users/1', element: <UsersDetailHeader userDetails={mockUser} /> },
        { path: '/admin/users', element: <div>Manage Users</div> }
      ];

      const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailHeader userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(router.state.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes the user and routes user back to Manage Users page', async () => {
      mockRestorationTrackerApi().user.deleteSystemUser.mockResolvedValue({
        response: 200
      } as any);

      const routes = [
        { path: '/admin/users/1', element: <UsersDetailHeader userDetails={mockUser} /> },
        { path: '/admin/users', element: <div>Manage Users</div> }
      ];

      const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailHeader userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });

      fireEvent.click(getAllByTestId('yes-button')[0]);

      await waitFor(() => {
        expect(router.state.location.pathname).toEqual('/admin/users');
      });
    });
  });
});
