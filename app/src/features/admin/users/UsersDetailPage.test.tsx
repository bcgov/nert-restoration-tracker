import { cleanup, render, waitFor } from '@testing-library/react';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectPlanApi.interface';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import UsersDetailPage from './UsersDetailPage';

const routes = [{ path: '/admin/users/1', element: <UsersDetailPage /> }];

const router = createMemoryRouter(routes, { initialEntries: ['/admin/users/1'] });

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
const mockUseApi = {
  user: {
    getUserById: jest.fn<Promise<IGetUserResponse>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  project: {
    getAllUserProjectsParticipation: jest.fn<Promise<IGetUserProjectsListResponse>, []>()
  }
};

describe('UsersDetailPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when selectedUser not yet loaded', async () => {
    const { getAllByTestId } = render(
      <RouterProvider router={router}>
        <UsersDetailPage />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('page-loading').length).toEqual(1);
    });
  });

  it('renders correctly when selectedUser are loaded', async () => {
    mockRestorationTrackerApi().user.getUserById.mockResolvedValue({
      id: 1,
      user_identifier: 'LongerUserName',
      record_end_date: 'end',
      role_names: ['role1', 'role2']
    });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue({
      project: null
    } as any);

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    const { getAllByTestId } = render(
      <RouterProvider router={router}>
        <UsersDetailPage />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
      expect(getAllByTestId('projects_header').length).toEqual(1);
    });
  });
});
