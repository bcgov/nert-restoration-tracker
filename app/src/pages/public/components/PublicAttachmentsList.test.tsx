import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import PublicAttachmentsList from './PublicAttachmentsList';
describe('PublicAttachmentsList', () => {
  afterEach(() => {
    cleanup();
  });

  const attachmentsList = [
    {
      id: 1,
      fileName: 'filename.test',
      lastModified: '2021-04-09 11:53:53',
      size: 100,
      url: 'https://something.com'
    },
    {
      id: 20,
      fileName: 'filename20.test',
      lastModified: '2021-04-09 11:53:53',
      size: 2000,
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

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={[]} getAttachments={jest.fn()} />
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for project attachments', async () => {
    window.open = jest.fn();

    const { getByText } = render(
      <PublicAttachmentsList
        projectId={1}
        attachmentsList={attachmentsList}
        getAttachments={jest.fn()}
      />
    );

    expect(getByText('filename30.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename30.test'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('https://something.com');
    });
  });

  it('renders correctly with attachments (of various sizes)', async () => {
    const { getByText } = render(
      <PublicAttachmentsList
        projectId={1}
        attachmentsList={attachmentsList}
        getAttachments={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it.skip('changing pages displays the correct rows as expected', () => {
    const largeAttachmentsList = [
      { ...attachmentsList[0] },
      {
        ...attachmentsList[0],
        id: 2,
        fileName: 'filename2.test'
      },
      {
        ...attachmentsList[0],
        id: 3,
        fileName: 'filename3.test'
      },
      {
        ...attachmentsList[0],
        id: 4,
        fileName: 'filename4.test'
      },
      {
        ...attachmentsList[0],
        id: 5,
        fileName: 'filename5.test'
      },
      {
        ...attachmentsList[0],
        id: 6,
        fileName: 'filename6.test'
      },
      {
        ...attachmentsList[0],
        id: 7,
        fileName: 'filename7.test'
      },
      {
        ...attachmentsList[0],
        id: 8,
        fileName: 'filename8.test'
      },
      {
        ...attachmentsList[0],
        id: 9,
        fileName: 'filename9.test'
      },
      {
        ...attachmentsList[0],
        id: 10,
        fileName: 'filename10.test'
      },
      {
        ...attachmentsList[0],
        id: 11,
        fileName: 'filename11.test'
      }
    ];

    const { getByText, queryByText, getByLabelText } = render(
      <PublicAttachmentsList
        projectId={1}
        attachmentsList={largeAttachmentsList}
        getAttachments={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename2.test')).toBeInTheDocument();
    expect(getByText('filename3.test')).toBeInTheDocument();
    expect(getByText('filename4.test')).toBeInTheDocument();
    expect(getByText('filename5.test')).toBeInTheDocument();
    expect(getByText('filename6.test')).toBeInTheDocument();
    expect(getByText('filename7.test')).toBeInTheDocument();
    expect(getByText('filename8.test')).toBeInTheDocument();
    expect(getByText('filename9.test')).toBeInTheDocument();
    expect(getByText('filename10.test')).toBeInTheDocument();
    expect(queryByText('filename11.test')).toBeNull();

    fireEvent.click(getByLabelText('Next page'));

    expect(getByText('filename11.test')).toBeInTheDocument();
    expect(queryByText('filename10.test')).toBeNull();
  });
});
