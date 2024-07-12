import {
  cleanup,
  fireEvent,
  getByTestId as rawGetByTestId,
  queryByTestId as rawQueryByTestId,
  render,
  waitFor
} from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import ProjectAttachments from './ProjectAttachments';

jest.mock('../../../hooks/useNertApi');
const mockRestorationTrackerApi = useNertApi as jest.Mock;
const mockUseApi = {
  project: {
    getProjectAttachments: jest.fn(),
    deleteProjectAttachment: jest.fn()
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

describe('ProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it.skip('correctly opens and closes the file upload dialog', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <ProjectAttachments
        attachmentsList={attachmentsList}
        getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
      />
    );

    expect(getByTestId('h2-button-toolbar-Upload')).toBeInTheDocument();
    expect(queryByText('Upload Documents', { exact: true })).not.toBeInTheDocument();

    fireEvent.click(getByTestId('h2-button-toolbar-Upload'));

    await waitFor(() => {
      expect(queryByText('Upload Documents', { exact: true })).toBeInTheDocument();
    });

    expect(getByText('Close')).toBeInTheDocument();

    fireEvent.click(getByText('Close'));

    await waitFor(() => {
      expect(queryByText('Upload Documents', { exact: true })).not.toBeInTheDocument();
    });
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <ProjectAttachments attachmentsList={[]} getAttachments={jest.fn()} />
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList
    });

    const { getByText } = render(
      <ProjectAttachments
        attachmentsList={attachmentsList}
        getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
      />
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockRestorationTrackerApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList
    });

    const { baseElement, queryByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <ProjectAttachments
          attachmentsList={attachmentsList}
          getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
        />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(
        rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')
      ).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('no-button'));

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
    mockRestorationTrackerApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList
    });

    const { baseElement, queryByText, getAllByRole, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <ProjectAttachments
          attachmentsList={attachmentsList}
          getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
        />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(
        rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')
      ).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    const background = getAllByRole('presentation')[0].firstChild;

    if (!background) {
      fail('Failed to click background.');
    }

    fireEvent.click(background);

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });
});
