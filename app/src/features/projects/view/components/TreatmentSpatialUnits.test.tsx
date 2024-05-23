import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import TreatmentSpatialUnits from './TreatmentSpatialUnits';

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectTreatmentsYears: jest.fn<Promise<{ year: number }[]>, [number]>()
  }
};

describe('TreatmentSpatialUnits', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no Treatment Years', async () => {
    await act(async () => {
      mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([]);
      const { queryByText } = render(
        <TreatmentSpatialUnits getTreatments={jest.fn()} getAttachments={jest.fn()} />
      );

      expect(queryByText('Import Treatments', { exact: false })).toBeNull();
    });
  });

  it('renders popup correctly', async () => {
    const { getAllByText, getByTestId } = render(
      <TreatmentSpatialUnits getTreatments={jest.fn()} getAttachments={jest.fn()} />
    );

    fireEvent.click(getByTestId('upload-spatial'));
    await waitFor(() => {
      const items = getAllByText('Import Treatments');
      expect(items).toHaveLength(2);
    });
  });

  it('renders correctly with Treatment Years', async () => {
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);

    const { getByText } = render(
      <TreatmentSpatialUnits getTreatments={jest.fn()} getAttachments={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByText('Filter Years (1)')).toBeInTheDocument();
    });
  });
});
