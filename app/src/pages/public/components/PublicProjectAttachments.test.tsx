import { cleanup, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectAttachments from './PublicProjectAttachments';

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockRestorationTrackerApi = useRestorationTrackerApi as jest.Mock;
const mockUseApi = {
  public: {
    project: {
      getProjectAttachments: jest.fn()
    }
  }
};

describe('PublicProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no attachments', async () => {
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    const { getByText } = render(
      <PublicProjectAttachments projectForViewData={getProjectForViewResponse} />
    );

    await waitFor(() => {
      expect(getByText('No Attachments')).toBeInTheDocument();
    });
  });

  it('renders correctly with attachments', async () => {
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename.test',
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    const { getByText } = render(
      <PublicProjectAttachments projectForViewData={getProjectForViewResponse} />
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });
});
