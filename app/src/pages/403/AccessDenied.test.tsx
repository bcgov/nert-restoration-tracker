import { fireEvent, render } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import AccessDenied from './AccessDenied';

describe('AccessDenied', () => {
  it('redirects to `/` when user is not authenticated', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: false
        },
        hasLoadedAllUserInfo: false,
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

    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <AccessDenied />
      </AuthStateContext.Provider>
    );
    const routes = [
      { path: '/', element: <div>Home</div> },
      { path: '/forbidden', element: renderObject },
      { path: '/request-submitted', element: <div>Request submitted</div> },
      { path: '/access-request', element: <div>Request access</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/forbidden'] });

    render(<RouterProvider router={router}>{renderObject}</RouterProvider>);

    expect(router.state.location.pathname).toEqual('/');
  });

  it('redirects to `/request-submitted` when user is authenticated and has a pending access request', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        hasAccessRequest: true,

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
    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <AccessDenied />
      </AuthStateContext.Provider>
    );
    const routes = [
      { path: '/', element: <div>Home</div> },
      { path: '/forbidden', element: renderObject },
      { path: '/request-submitted', element: <div>Request submitted</div> },
      { path: '/access-request', element: <div>Request access</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/forbidden'] });

    render(<RouterProvider router={router}>{renderObject}</RouterProvider>);

    expect(router.state.location.pathname).toEqual('/request-submitted');
  });

  it('renders correctly when the user is authenticated and has no pending access requests', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        hasAccessRequest: false,

        systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <AccessDenied />
      </AuthStateContext.Provider>
    );

    const routes = [
      { path: '/', element: <div>Home</div> },
      { path: '/forbidden', element: renderObject },
      { path: '/request-submitted', element: <div>Request submitted</div> },
      { path: '/access-request', element: <div>Request access</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/forbidden'] });

    const { getByText, queryByTestId } = render(
      <RouterProvider router={router}>{renderObject}</RouterProvider>
    );

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(queryByTestId('request_access')).not.toBeInTheDocument();
  });

  it('redirects to `/access-request` when the `Request Access` button clicked', () => {
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

    const renderObject = (
      <AuthStateContext.Provider value={authState}>
        <AccessDenied />
      </AuthStateContext.Provider>
    );

    const routes = [
      { path: '/', element: <div>Home</div> },
      { path: '/forbidden', element: renderObject },
      { path: '/request-submitted', element: <div>Request submitted</div> },
      { path: '/access-request', element: <div>Request access</div> }
    ];

    const router = createMemoryRouter(routes, { initialEntries: ['/forbidden'] });

    const { getByText, getByTestId } = render(
      <RouterProvider router={router}>{renderObject}</RouterProvider>
    );

    expect(getByText('You do not have permission to access this application.')).toBeVisible();
    expect(getByTestId('request_access')).toBeVisible();

    fireEvent.click(getByText('Request Access'));

    expect(router.state.location.pathname).toEqual('/access-request');
  });
});
