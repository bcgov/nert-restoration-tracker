import { cleanup, render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectPlanApi.interface';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import MyProjectsPlansListPage from './MyProjectsPlansListPage';

jest.mock('../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
const mockUseApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  project: {
    getUserProjectsList: jest.fn<Promise<IGetProjectForViewResponse[]>, []>()
  },
  draft: {
    getDraftsList: jest.fn<Promise<IGetDraftsListResponse[]>, []>()
  }
};

describe('MyProjectsPlansListPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with the create project button when user has a valid system role', async () => {
    mockRestorationTrackerApi().project.getUserProjectsList.mockResolvedValue([]);
    mockRestorationTrackerApi().draft.getDraftsList.mockResolvedValue([]);

    const authState = getMockAuthState({
      keycloakWrapper: {
        hasSystemRole: () => true
      }
    });

    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <MyProjectsPlansListPage />
      </AuthStateContext.Provider>
    );

    const routes = [{ path: '/projects', element: renderObject }];

    const router = createMemoryRouter(routes, { initialEntries: ['/projects'] });

    const { getByText, queryAllByTestId } = render(
      <RouterProvider router={router}>renderObject</RouterProvider>
    );

    await waitFor(() => {
      expect(getByText('My Projects')).toBeInTheDocument();
      expect(getByText('My Plans')).toBeInTheDocument();
      expect(queryAllByTestId('create-project-button')[0]).toBeInTheDocument();
    });
  });

  it('renders without the create project button when user does not have a valid system role', async () => {
    const authState = getMockAuthState();
    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <MyProjectsPlansListPage />
      </AuthStateContext.Provider>
    );

    const routes = [{ path: '/projects', element: renderObject }];

    const router = createMemoryRouter(routes, { initialEntries: ['/projects'] });

    const { getByText, queryByTestId } = render(
      <RouterProvider router={router}>renderObject</RouterProvider>
    );

    await waitFor(() => {
      expect(getByText('My Projects')).toBeInTheDocument();
      expect(getByText('My Plans')).toBeInTheDocument();
      expect(queryByTestId('create-project-button')).not.toBeInTheDocument();
    });
  });
});
