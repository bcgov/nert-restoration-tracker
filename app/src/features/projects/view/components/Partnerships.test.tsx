import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';
import { CodesContext } from 'contexts/codesContext';

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
      <CodesContext.Provider
        value={{ codesDataLoader: { data: { partnership_type: [{ id: 1 }] } } } as any}>
        <Partnerships
          projectForViewData={{
            ...getProjectForViewResponse,
            partnership: {
              partnerships: [
                { partnership_type: '1', partnership_ref: 'id', partnership_name: 'name' }
              ]
            }
          }}
          refresh={mockRefresh}
        />
      </CodesContext.Provider>
    );

    expect(getAllByTestId('partnerships_data').length).toEqual(1);
  });
});
