import { cleanup, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { MemoryRouter } from 'react-router';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';
import { IProjectAdvancedFilters, ProjectAdvancedFiltersInitialValues } from './ProjectFilter';

jest.mock('../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
const mockUseApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

describe.skip('ProjectAdvancedFilters', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  test.skip('renders properly when no props are given', async () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Formik initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters region={[]} status={[]} focus={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByLabelText('Contact Agency')).toBeInTheDocument();
      expect(getByLabelText('Start Date')).toBeInTheDocument();
      expect(getByLabelText('End Date')).toBeInTheDocument();
      expect(getByLabelText('Funding Agencies')).toBeInTheDocument();
      expect(getByLabelText('Species')).toBeInTheDocument();
      expect(getByLabelText('Permit Number')).toBeInTheDocument();
    });
  });

  test.skip('renders properly when props are given', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Formik initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters region={[]} status={[]} focus={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('advancedFilters')).toBeInTheDocument();
      expect(getByTestId('contact_agency')).toBeInTheDocument();
      expect(getByTestId('permit_number')).toBeInTheDocument();
      expect(getByTestId('start_date')).toBeInTheDocument();
      expect(getByTestId('end_date')).toBeInTheDocument();
      expect(getByTestId('species')).toBeInTheDocument();
    });
  });

  test.skip('renders properly when props and inital values are given', async () => {
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });

    const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
      permit_number: 'temp2',
      start_date: '',
      end_date: '',
      keyword: 'temp3'
    };

    const { queryByText } = render(
      <MemoryRouter>
        <Formik<IProjectAdvancedFilters>
          initialValues={ProjectAdvancedFiltersInitialValues}
          onSubmit={() => {}}>
          <ProjectAdvancedFilters region={[]} status={[]} focus={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(queryByText('species1')).toBeInTheDocument();
      expect(queryByText('label1')).toBeInTheDocument();
    });
  });
});
