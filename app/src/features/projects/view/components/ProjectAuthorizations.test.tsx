import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectAuthorizations from './ProjectAuthorizations';

const mockRefresh = jest.fn();

describe('ProjectPermits', () => {
  it('renders correctly with no permits', () => {
    const { getByTestId } = render(
      <ProjectAuthorizations
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            permits: []
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('no_authorization_loaded')).toBeVisible();
  });

  it('renders permits data correctly', async () => {
    const { getByTestId, getByText } = render(
      <ProjectAuthorizations
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            permits: [
              {
                permit_number: '123',
                permit_type: 'Test Permit Type'
              }
            ]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('authorization_item')).toBeInTheDocument();

    expect(getByText('123', { exact: false })).toBeVisible();
    expect(getByText('Test Permit Type', { exact: false })).toBeVisible();
  });
});
