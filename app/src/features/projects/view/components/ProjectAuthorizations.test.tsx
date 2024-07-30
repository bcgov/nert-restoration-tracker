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
          authorization: {
            authorizations: []
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('no_authorization_loaded')).toBeVisible();
  });

  it('renders authorizations data correctly', async () => {
    const { getByTestId, getByText, findByText } = render(
      <ProjectAuthorizations
        projectForViewData={{
          ...getProjectForViewResponse,
          authorization: {
            authorizations: [
              {
                authorization_ref: '123',
                authorization_type: 'Test Permit Type',
                authorization_desc: 'Description'
              }
            ]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('authorization_item')).toBeInTheDocument();

    // [OI] commented the following 2 lines as these values are now in a tooltip element
    // expect(getByText('123', { exact: false })).toBeInTheDocument();
    // expect(getByText('Description', { exact: false })).toBeInTheDocument();

    expect(getByText('Test Permit Type', { exact: false })).toBeVisible();
  });
});
