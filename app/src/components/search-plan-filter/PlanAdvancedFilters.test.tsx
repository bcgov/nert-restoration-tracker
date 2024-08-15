import { cleanup, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import { MemoryRouter } from 'react-router';
import PlanAdvancedFilters from './PlanAdvancedFilters';
import { IPlanAdvancedFilters, PlanAdvancedFiltersInitialValues } from './PlanFilter';

jest.mock('../../hooks/useNertApi');
const mockuseNertApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

const mockRestorationTrackerApi = (
  useNertApi as unknown as jest.Mock<typeof mockuseNertApi>
).mockReturnValue(mockuseNertApi);

describe.skip('ProjectAdvancedFilters', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockClear();
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders properly when no props are given', async () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Formik initialValues={PlanAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <PlanAdvancedFilters region={[]} status={[]} focus={[]} />
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

  test('renders properly when props are given', async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Formik initialValues={PlanAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <PlanAdvancedFilters region={[]} status={[]} focus={[]} />
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

  test('renders properly when props and inital values are given', async () => {
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });

    const ProjectAdvancedFiltersInitialValues: IPlanAdvancedFilters = {
      permit_number: 'temp2',
      start_date: '',
      end_date: '',
      keyword: 'temp3'
    };

    const { queryByText } = render(
      <MemoryRouter>
        <Formik<IPlanAdvancedFilters>
          initialValues={ProjectAdvancedFiltersInitialValues}
          onSubmit={() => {}}>
          <PlanAdvancedFilters region={[]} status={[]} focus={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(queryByText('species1')).toBeInTheDocument();
      expect(queryByText('label1')).toBeInTheDocument();
    });
  });
});
