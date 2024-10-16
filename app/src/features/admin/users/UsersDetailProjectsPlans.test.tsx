import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
import { useNertApi } from '../../../hooks/useNertApi';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import UsersDetailProjectsPlans from 'features/admin/users/UsersDetailProjectsPlans';
import { useCodesContext } from 'hooks/useContext';

jest.mock('../../../hooks/useNertApi');
const mockRestorationTrackerApi = useNertApi as jest.Mock;

const mockUseApi = {
  project: {
    getAllUserProjectsParticipation: jest.fn<Promise<IGetUserProjectsListResponse[]>, []>(),
    removeProjectParticipant: jest.fn<Promise<boolean>, []>(),
    updateProjectParticipantRole: jest.fn<Promise<boolean>, []>()
  }
};

jest.mock('../../../hooks/useContext');
const mockUseCodes = useCodesContext as unknown as jest.MockedFunction<typeof useCodesContext>;

const mockUser = {
  id: 1,
  record_end_date: 'ending',
  user_identifier: 'testUser',
  role_names: ['system']
} as ISystemUser;

const routes = [
  {
    path: '/admin/projects/1/details',
    element: <UsersDetailProjectsPlans userDetails={mockUser} />
  }
];

const router = createMemoryRouter(routes, { initialEntries: ['/admin/projects/1/details'] });

describe.skip('UsersDetailProjectsPlans', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
    mockUseCodes.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when assignedProjects not yet loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: undefined, isLoading: true, isReady: false });

    const { getAllByTestId } = render(
      <RouterProvider router={router}>
        <UsersDetailProjectsPlans userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('project-loading').length).toEqual(1);
    });
  });

  it('renders empty list correctly when assignedProjects empty and loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue({
      assignedProjects: []
    } as any);

    const { getAllByTestId, getAllByText } = render(
      <RouterProvider router={router}>
        <UsersDetailProjectsPlans userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects ()').length).toEqual(1);
      expect(getAllByText('No Projects').length).toEqual(1);
    });
  });

  it('renders list of a single project correctly when assignedProjects are loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 2,
        name: 'projectName',
        system_user_id: 1,
        project_role_id: 2,
        project_participation_id: 4
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <RouterProvider router={router}>
        <UsersDetailProjectsPlans userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
    });
  });

  it('renders list of a multiple projects correctly when assignedProjects are loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 2,
        project_participation_id: 4
      },
      {
        project_id: 5,
        name: 'secondProjectName',
        system_user_id: 6,
        project_role_id: 7,
        project_participation_id: 8
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <RouterProvider router={router}>
        <UsersDetailProjectsPlans userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
      expect(getAllByText('secondProjectName').length).toEqual(1);
    });
  });

  it('routes to project id details on click', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 2,
        project_participation_id: 4
      }
    ]);

    const { getAllByText, getByText } = render(
      <RouterProvider router={router}>
        <UsersDetailProjectsPlans userDetails={mockUser} />
      </RouterProvider>
    );

    await waitFor(() => {
      expect(getAllByText('projectName').length).toEqual(1);
    });

    fireEvent.click(getByText('projectName'));

    await waitFor(() => {
      expect(router.state.location.pathname).toEqual('/admin/projects/1/details');
    });
  });

  describe('Are you sure? Dialog', () => {
    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 2,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByTestId, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailProjectsPlans userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByTestId('remove-project-participant-button'));

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(router.state.location.pathname).toEqual('/admin/projects/1/details');
      });
    });

    it('deletes User from project if the user clicks on `Remove User` ', async () => {
      mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

      mockRestorationTrackerApi().project.removeProjectParticipant.mockResolvedValue(true);

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 2,
          project_participation_id: 4
        },
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      const { getAllByText, getByText, getAllByTestId } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailProjectsPlans userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      fireEvent.click(getAllByTestId('remove-project-participant-button')[0]);

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });
    });
  });

  describe('Change users Project Role', () => {
    it('renders list of roles to change per project', async () => {
      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          project_roles: [
            { id: 1, name: 'Lead Editor' },
            { id: 2, name: 'Editor' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 2,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <RouterProvider router={router}>
          <UsersDetailProjectsPlans userDetails={mockUser} />
        </RouterProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Lead Editor').length).toEqual(1);
      });
    });

    it('renders dialog pop on role selection, does nothing if user clicks `Cancel` ', async () => {
      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          project_roles: [
            { id: 1, name: 'Lead Editor' },
            { id: 2, name: 'Editor' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 2,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailProjectsPlans userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Lead Editor'));

      await waitFor(() => {
        expect(getAllByText('Editor').length).toEqual(1);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(router.state.location.pathname).toEqual('/admin/projects/1/details');
      });
    });

    it('renders dialog pop on role selection, Changes role on click of `Change Role` ', async () => {
      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          project_roles: [
            { id: 1, name: 'Lead Editor' },
            { id: 2, name: 'Editor' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 2,
          project_participation_id: 4
        }
      ]);

      mockRestorationTrackerApi().project.updateProjectParticipantRole.mockResolvedValue(true);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <RouterProvider router={router}>
            <UsersDetailProjectsPlans userDetails={mockUser} />
          </RouterProvider>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Lead Editor'));

      await waitFor(() => {
        expect(getAllByText('Editor').length).toEqual(1);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Change Role'));

      await waitFor(() => {
        expect(getAllByText('Editor').length).toEqual(1);
      });
    });
  });
});
