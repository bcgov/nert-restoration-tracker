// import { cleanup, render, waitFor } from '@testing-library/react';
// import { SYSTEM_ROLE } from 'constants/roles';
// import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
// import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
// import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
// import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
// import React from 'react';
// import { createMemoryRouter, RouterProvider } from 'react-router-dom';
// import { getMockAuthState } from 'test-helpers/auth-helpers';
// import { codes } from 'test-helpers/code-helpers';
// import { getProjectForViewResponse } from 'test-helpers/project-helpers';
// import ViewProjectPage from './ViewProjectPage';

// jest.mock('../../../hooks/useRestorationTrackerApi');
// const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
// const mockUseApi = {
//   project: {
//     getProjectById: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
//   },
//   codes: {
//     getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
//   }
// };

// const defaultAuthState = {
//   keycloakWrapper: {
//     keycloak: {
//       authenticated: true
//     },
//     hasLoadedAllUserInfo: true,
//     systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
//     getUserIdentifier: () => 'testuser',
//     hasAccessRequest: false,
//     hasSystemRole: () => true,
//     getIdentitySource: () => 'idir',
//     username: 'testusername',
//     displayName: 'testdisplayname',
//     email: 'test@email.com',
//     refresh: () => {}
//   }
// };

describe.skip('ViewProjectPage', () => {
  it('renders component correctly', async () => {});
});
//   beforeEach(() => {
//     mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
//   });

//   afterEach(() => {
//     cleanup();
//   });

//   it('renders component correctly', async () => {
//     mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

//     mockRestorationTrackerApi().project.getProjectById.mockResolvedValue(getProjectForViewResponse);

//     const authState = getMockAuthState({
//       keycloakWrapper: {
//         ...defaultAuthState.keycloakWrapper,
//         systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
//         hasSystemRole: () => true
//       }
//     });

//     const renderObject = (
//       <AuthStateContext.Provider value={authState as unknown as IAuthState}>
//         <ViewProjectPage />
//       </AuthStateContext.Provider>
//     );

//     const routes = [
//       { path: '/', element: renderObject },
//       { path: '/logout', element: <div>Log out</div> }
//     ];

//     const router = createMemoryRouter(routes, { initialEntries: ['/'] });

//     const { getByTestId } = render(<RouterProvider router={router}></RouterProvider>);

//     await waitFor(() => {
//       expect(getByTestId('view_project_page_component')).toBeVisible();
//     });
//   });

//   it('renders spinner when no codes is loaded', async () => {
//     mockRestorationTrackerApi().project.getProjectById.mockResolvedValue(getProjectForViewResponse);

//     const authState = getMockAuthState({
//       keycloakWrapper: {
//         ...defaultAuthState.keycloakWrapper,
//         systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
//         hasSystemRole: () => true
//       }
//     });

//     const renderObject = (
//       <AuthStateContext.Provider value={authState as unknown as IAuthState}>
//         <ViewProjectPage />
//       </AuthStateContext.Provider>
//     );

//     const routes = [
//       { path: '/', element: renderObject },
//       { path: '/logout', element: <div>Log out</div> }
//     ];

//     const router = createMemoryRouter(routes, { initialEntries: ['/'] });

//     const { getByTestId } = render(<RouterProvider router={router}></RouterProvider>);

//     await waitFor(() => {
//       expect(getByTestId('loading_spinner')).toBeVisible();
//     });
//   });

//   it('renders spinner when no project is loaded', async () => {
//     mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

//     const authState = getMockAuthState({
//       keycloakWrapper: {
//         ...defaultAuthState.keycloakWrapper,
//         systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
//         hasSystemRole: () => true
//       }
//     });

//     const renderObject = (
//       <AuthStateContext.Provider value={authState as unknown as IAuthState}>
//         <ViewProjectPage />
//       </AuthStateContext.Provider>
//     );

//     const routes = [
//       { path: '/', element: renderObject },
//       { path: '/logout', element: <div>Log out</div> }
//     ];

//     const router = createMemoryRouter(routes, { initialEntries: ['/'] });

//     const { getByTestId } = render(<RouterProvider router={router}></RouterProvider>);

//     await waitFor(() => {
//       expect(getByTestId('loading_spinner')).toBeVisible();
//     });
//   });
// });
