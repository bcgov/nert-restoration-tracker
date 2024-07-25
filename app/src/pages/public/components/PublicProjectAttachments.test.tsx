import { cleanup, render, waitFor } from '@testing-library/react';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import PublicProjectAttachments from './PublicProjectAttachments';

jest.mock('../../../hooks/useNertApi');
const mockRestorationTrackerApi = useNertApi as jest.Mock;
const mockUseApi = {
  project: {
    getProjectAttachments: jest.fn()
  }
};

const attachmentsList = [
  {
    id: 1,
    fileName: 'filename.test',
    lastModified: '2021-04-09 11:53:53',
    size: 3028,
    url: 'https://something.com'
  },
  {
    id: 20,
    fileName: 'filename20.test',
    lastModified: '2021-04-09 11:53:53',
    size: 30280000,
    url: 'https://something.com'
  },
  {
    id: 30,
    fileName: 'filename30.test',
    lastModified: '2021-04-09 11:53:53',
    size: 30280000000,
    url: 'https://something.com'
  }
];

describe('PublicProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <PublicProjectAttachments attachmentsList={[]} getAttachments={jest.fn()} />
    );

    expect(getByText('No Documents Attached')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    const { getByText } = render(
      <PublicProjectAttachments attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });
});
