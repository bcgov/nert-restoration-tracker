import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import AccessRequestPage from './AccessRequestPage';

const routes = [
  { path: '/access-request', element: <AccessRequestPage /> },
  { path: '/logout', element: <div>Log out</div> }
];

const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

jest.mock('../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;

const mockUseApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  admin: {
    createAdministrativeActivity: jest.fn()
  }
};

const renderContainer = () => {
  const authState = getMockAuthState({
    keycloakWrapper: {
      keycloak: {
        authenticated: true
      },
      hasLoadedAllUserInfo: true,
      hasAccessRequest: false,

      systemRoles: [],
      getUserIdentifier: jest.fn(),
      hasSystemRole: jest.fn(),
      getIdentitySource: jest.fn(),
      username: 'testusername',
      displayName: 'testdisplayname',
      email: 'test@email.com',
      refresh: () => {}
    }
  });

  return render(
    <AuthStateContext.Provider value={authState as any}>
      <DialogContextProvider>
        <RouterProvider router={router}>
          <AccessRequestPage />
        </RouterProvider>
      </DialogContextProvider>
    </AuthStateContext.Provider>
  );
};

describe('AccessRequestPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
    mockUseApi.codes.getAllCodeSets.mockClear();
    mockUseApi.admin.createAdministrativeActivity.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Log Out', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/access-request', '/logout'] });

    it('should redirect to `/logout`', async () => {
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Creator' }]
      });

      const authState = getMockAuthState({
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          },
          hasLoadedAllUserInfo: true,
          hasAccessRequest: false,

          systemRoles: [],
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          refresh: () => {}
        }
      });

      const { getByText } = render(
        <AuthStateContext.Provider value={authState as any}>
          <RouterProvider router={router}>
            <AccessRequestPage />
          </RouterProvider>
        </AuthStateContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      waitFor(() => {
        expect(router.location.pathname).toEqual('/logout');
      });
    });
  });

  it.skip('processes a successful request submission', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockRestorationTrackerApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: 1
    });

    const { getByText, getAllByRole, getByRole } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(router.location.pathname).toEqual('/request-submitted');
    });
  });

  it.skip('takes the user to the request-submitted page immediately if they already have an access request', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        hasAccessRequest: false,

        systemRoles: [],
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: '',
        displayName: '',
        email: '',
        refresh: () => {}
      }
    });

    render(
      <AuthStateContext.Provider value={authState as any}>
        <RouterProvider router={router}>
          <AccessRequestPage />
        </RouterProvider>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(router.location.pathname).toEqual('/request-submitted');
    });
  });

  it.skip('shows error dialog with api error message when submission fails', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockRestorationTrackerApi().admin.createAdministrativeActivity = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it.skip('shows error dialog with default error message when response from createAdministrativeActivity is invalid', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockRestorationTrackerApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: null
    });

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeNull();
    });
  });
});
