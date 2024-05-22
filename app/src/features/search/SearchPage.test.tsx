import { render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import React from 'react';

jest.mock('../../hooks/useRestorationTrackerApi');

const mockUseApi = {
  search: {
    getSearchResults: jest.fn<Promise<IGetSearchResultsResponse[]>, []>()
  },
  public: {
    search: {
      getSearchResults: jest.fn<Promise<IGetSearchResultsResponse[]>, []>()
    }
  }
};
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;

describe.skip('SearchPage', () => {
  it('renders correctly', async () => {
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);

    const { getByText } = render(<></>);

    await waitFor(() => {
      expect(getByText('Map')).toBeInTheDocument();
    });
  });
});
