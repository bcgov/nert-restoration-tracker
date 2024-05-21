import { fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import RequestSubmitted from './RequestSubmitted';

describe('RequestSubmitted', () => {
  it('renders a spinner when `hasLoadedAllUserInfo` is false', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        hasLoadedAllUserInfo: false,
        systemRoles: [],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const routes = [{ path: '/access-request', element: <RequestSubmitted /> }];

    const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

    const { queryAllByText } = render(
      <AuthStateContext.Provider value={authState}>
        <RouterProvider router={router}>
          <RequestSubmitted />
        </RouterProvider>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(router.state.location.pathname).toEqual('/access-request');
    expect(queryAllByText('Access Request Submitted').length).toEqual(0);
  });

  it('redirects to `/admin/projects` when user has at least 1 system role', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const routes = [
      { path: '/access-request', element: <RequestSubmitted /> },
      { path: '/admin/projects', element: <div>Admin Projects</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

    render(
      <AuthStateContext.Provider value={authState}>
        <RouterProvider router={router}>
          <RequestSubmitted />
        </RouterProvider>
      </AuthStateContext.Provider>
    );

    expect(router.state.location.pathname).toEqual('/admin/projects');
  });

  it('redirects to `/` when user has no pending access request', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const routes = [
      { path: '/access-request', element: <RequestSubmitted /> },
      { path: '/admin/projects', element: <div>Admin Projects</div> },
      { path: '/', element: <div>Home</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

    render(
      <AuthStateContext.Provider value={authState}>
        <RouterProvider router={router}>
          <RequestSubmitted />
        </RouterProvider>
      </AuthStateContext.Provider>
    );

    expect(router.state.location.pathname).toEqual('/');
  });

  it('renders correctly when user has no role but has a pending access requests', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: true,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const routes = [
      { path: '/access-request', element: <RequestSubmitted /> },
      { path: '/admin/projects', element: <div>Admin Projects</div> },
      { path: '/', element: <div>Home</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <RouterProvider router={router}>
          <RequestSubmitted />
        </RouterProvider>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(router.state.location.pathname).toEqual('/access-request');

    expect(getByText('Log Out')).toBeVisible();
  });

  describe('Log Out', () => {
    it('should redirect to `/logout`', async () => {
      const authState = getMockAuthState({
        keycloakWrapper: {
          hasLoadedAllUserInfo: true,
          systemRoles: [],
          hasAccessRequest: true,

          keycloak: {},
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          refresh: () => {}
        }
      });

      const routes = [
        { path: '/access-request', element: <RequestSubmitted /> },
        { path: '/admin/projects', element: <div>Admin Projects</div> },
        { path: '/', element: <div>Home</div> },
        { path: '/logout', element: <div>Logout</div> }
      ];

      const router = createMemoryRouter(routes, { initialEntries: ['/access-request'] });

      const { getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <RouterProvider router={router}>
            <RequestSubmitted />
          </RouterProvider>
        </AuthStateContext.Provider>
      );

      fireEvent.click(getByTestId('logout-button'));

      waitFor(() => {
        expect(router.state.location.pathname).toEqual('/logout');
      });
    });
  });
});
