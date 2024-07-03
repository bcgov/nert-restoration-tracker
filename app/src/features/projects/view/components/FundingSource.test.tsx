import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';

describe('FundingSource', () => {
  it('renders correctly with 1 funding source', () => {
    const { getByText } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
          funding: {
            fundingSources: [
              {
                organization_name: 'agency name',
                description: 'ABC123',
                investment_action_category: 1,
                funding_project_id: 'investment action',
                funding_amount: 333,
                start_date: '2021-01-10',
                end_date: '2021-01-20',
                is_public: 'string'
              }
            ]
          }
        }}
      />
    );

    expect(getByText('agency name', { exact: false })).toBeVisible();
    expect(getByText('$333', { exact: false })).toBeVisible();
    expect(getByText('ABC123', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('Jan 20, 2021', { exact: false })).toBeVisible();
  });

  it('renders correctly with no funding sources', () => {
    const { getByTestId } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
          funding: {
            fundingSources: []
          }
        }}
      />
    );

    expect(getByTestId('no_funding_sources')).toBeVisible();
  });
});
