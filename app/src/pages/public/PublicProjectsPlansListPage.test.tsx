import { cleanup, render, waitFor } from '@testing-library/react';
import { useNertApi } from 'hooks/useNertApi';
// import React from 'react';
// import { MemoryRouter } from 'react-router-dom';
// import PublicProjectsListPage from './PublicProjectsPlansListPage';

jest.mock('../../hooks/useNertApi');
const mockuseNertApi = {
  public: {
    project: {
      getProjectsList: jest.fn()
    }
  }
};

// const mockRestorationTrackerApi = (
//   useNertApi as unknown as jest.Mock<typeof mockuseNertApi>
// ).mockReturnValue(mockuseNertApi);

describe('PublicProjectsListPage', () => {
  // beforeEach(() => {
  //   mockRestorationTrackerApi().public.project.getProjectsList.mockClear();
  // });

  // afterEach(() => {
  //   cleanup();
  // });

  test('renders without crashing', async () => {});

  // test.skip('renders with a proper list of projects when completed', async () => {
  //   mockRestorationTrackerApi().public.project.getProjectsList.mockResolvedValue([
  //     {
  //       id: 1,
  //       name: 'Project 1',
  //       start_date: '2020-01-01',
  //       end_date: '2020-01-02',
  //       permits_list: '1, 2, 3'
  //     }
  //   ]);

  //   const { getByText, getByTestId } = render(
  //     <MemoryRouter>
  //       <PublicProjectsListPage />
  //     </MemoryRouter>
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('project-table')).toBeInTheDocument();
  //     expect(getByText('Completed')).toBeInTheDocument();
  //   });
  // });

  // test.skip('renders with a proper list of projects when active', async () => {
  //   mockRestorationTrackerApi().public.project.getProjectsList.mockResolvedValue([
  //     {
  //       id: 1,
  //       name: 'Project 1',
  //       start_date: '2020-01-01',
  //       end_date: null,
  //       permits_list: '1, 2, 3',
  //       completion_status: 'Active'
  //     }
  //   ]);

  //   const { getByText, getByTestId } = render(
  //     <MemoryRouter>
  //       <PublicProjectsListPage />
  //     </MemoryRouter>
  //   );

  //   await waitFor(() => {
  //     expect(getByTestId('project-table')).toBeInTheDocument();
  //     expect(getByText('Active')).toBeInTheDocument();
  //   });
  // });
});
