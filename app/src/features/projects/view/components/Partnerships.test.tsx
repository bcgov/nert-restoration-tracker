import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';

const mockRefresh = jest.fn();

describe('Partnerships', () => {
  it('renders correctly with default empty values', () => {
    const { getByTestId } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnership: {
            partnerships: []
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('no_partnerships_data')).toBeVisible();
  });

  it('renders correctly with existing partnership values', () => {
    const { getAllByTestId } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnership: {
            partnerships: [{ partnership: 'partner2' }, { partnership: 'partner3' }]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getAllByTestId('partnerships_data').length).toEqual(2);
  });
});
