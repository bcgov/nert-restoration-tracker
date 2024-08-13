import { cleanup, render, waitFor } from '@testing-library/react';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
import ManageUsersPage from './ManageUsersPage';
import { useCodesContext } from 'hooks/useContext';

const renderContainer = () => {
  const routes = [{ path: '/123', element: <ManageUsersPage /> }];

  const router = createMemoryRouter(routes, { initialEntries: ['/123'] });

  return render(
    <RouterProvider router={router}>
      <ManageUsersPage />
    </RouterProvider>
  );
};

jest.mock('../../../hooks/useNertApi');

const mockRestorationTrackerApi = useNertApi as jest.Mock;

const mockUseApi = {
  admin: {
    getAdministrativeActivities: jest.fn()
  },
  user: {
    getUsersList: jest.fn()
  }
};

jest.mock('../../../hooks/useCodesContext');
const mockUseCodes = useCodesContext as unknown as jest.MockedFunction<typeof useCodesContext>;

describe('ManageUsersPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
    mockUseCodes.mockClear();

    // mock code set response
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the main page content correctly', async () => {
    mockRestorationTrackerApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests and active users component', async () => {
    mockRestorationTrackerApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
      expect(getByText('No Active Users')).toBeVisible();
    });
  });
});
