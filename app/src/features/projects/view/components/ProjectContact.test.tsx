import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectContact from './ProjectContact';

jest.mock('../../../../hooks/useNertApi');

const mockRefresh = jest.fn();

describe('ProjectContact', () => {
  it('renders contact data correctly', async () => {
    const { getByTestId } = render(
      <ProjectContact
        projectForViewData={{
          ...getProjectForViewResponse,
          contact: {
            contacts: [
              {
                first_name: 'Amanda',
                last_name: 'Christensen',
                email_address: 'amanda@christensen.com',
                organization: 'Amanda and associates',
                phone_number: '010-123-1234',
                is_public: 'true',
                is_primary: 'true',
                is_first_nation: true
              }
            ]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('contact_name')).toBeInTheDocument();
  });
});
