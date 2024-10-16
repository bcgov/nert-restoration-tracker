import {
  cleanup,
  findByText as rawFindByText,
  fireEvent,
  getByText as rawGetByText,
  render,
  waitFor
} from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useCodesContext } from 'hooks/useContext';
// import { ProjectLocationFormInitialValues } from 'features/projects/components/ProjectLocationForm';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';

jest.mock('../../../hooks/useContext');
const mockUseCodes = (useCodesContext as unknown as jest.Mock).mockReturnValue({ codes: codes });

jest.mock('../../../hooks/useNertApi');
const mockRestorationTrackerApi = useNertApi as jest.Mock;

const mockUseApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  draft: {
    createDraft: jest.fn<Promise<object>, []>(),
    updateDraft: jest.fn<Promise<object>, []>(),
    getDraft: jest.fn()
  }
};

const routes = [
  { path: '/admin/projects/create', element: <></> },
  { path: '/admin/user/projects', element: <div>Projects</div> }
];

const router = createMemoryRouter(routes, { initialEntries: ['/admin/projects/create'] });

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <RouterProvider router={router}>
        <></>,
      </RouterProvider>
    </DialogContextProvider>
  );
};

describe.skip('CreateProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi.mockImplementation(() => mockUseApi);
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockClear();
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
    mockRestorationTrackerApi().draft.createDraft.mockClear();
    mockRestorationTrackerApi().draft.updateDraft.mockClear();
    mockRestorationTrackerApi().draft.getDraft.mockClear();

    mockUseCodes.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();

      expect(getByText('Contacts')).toBeVisible();

      expect(getByText('Permits')).toBeVisible();

      expect(getByText('Funding and Partnerships')).toBeVisible();

      expect(getByText('Location')).toBeVisible();
    });
  });

  it('shows the page title', async () => {
    const { findByText } = renderContainer();

    const PageTitle = await findByText('Create Restoration Project');

    expect(PageTitle).toBeVisible();
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Cancel and Exit` button', async () => {
      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureTitle = await findByText('Cancel Create Project');
      const AreYouSureText = await findByText('Are you sure you want to cancel?');
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(AreYouSureTitle).toBeVisible();
      expect(AreYouSureText).toBeVisible();
      expect(AreYouSureYesButton).toBeVisible();
    });

    it('calls history.push() if the user clicks `Yes`', async () => {
      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(router.state.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureYesButton);
      expect(router.state.location.pathname).toEqual('/admin/user/projects');
    });

    it('does nothing if the user clicks `No`', async () => {
      const { findByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findByText('Cancel and Exit', { exact: false });

      fireEvent.click(BackToProjectsButton);
      const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No', { exact: false });

      expect(router.state.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureNoButton);
      expect(router.state.location.pathname).toEqual('/admin/projects/create');
    });
  });

  describe('draft project', () => {
    // it('preloads draft data and populates on form fields', async () => {
    //   mockRestorationTrackerApi().draft.getDraft.mockResolvedValue({
    //     id: 1,
    //     name: 'My draft',
    //     data: {
    //       contact: {
    //         contacts: [
    //           {
    //             first_name: 'Draft first name',
    //             last_name: 'Draft last name',
    //             email_address: 'draftemail@example.com',
    //             agency: '',
    //             is_public: 'false',
    //             is_primary: 'false'
    //           }
    //         ]
    //       },
    //       ...ProjectAuthorizationFormInitialValues,
    //       ...ProjectGeneralInformationFormInitialValues,
    //       ...ProjectLocationFormInitialValues,
    //       ...ProjectWildlifeFormInitialValues,
    //       ...ProjectFundingFormInitialValues,
    //       ...ProjectPartnershipsFormInitialValues
    //     }
    //   });

    //   render(
    //     <MemoryRouter initialEntries={['?draftId=1']}>
    //       <></>
    //     </MemoryRouter>
    //   );

    //   await waitFor(() => {
    //     expect(screen.getByText('Draft first name Draft last name')).toBeVisible();
    //     expect(screen.getByText('draftemail@example.com')).toBeInTheDocument();
    //   });
    // });

    it('opens the save as draft dialog', async () => {
      const { getByTestId, getByText } = renderContainer();

      const saveAsDraftButton = await getByTestId('project-save-draft-button');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });
    });

    it('closes the dialog on cancel button click', async () => {
      const { getByTestId, getByText, queryByText, getByRole } = renderContainer();

      const saveAsDraftButton = await getByTestId('project-save-draft-button');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      const cancelButton = rawGetByText(getByRole('dialog'), 'Cancel');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions and closes the dialog on save button click', async () => {
      mockRestorationTrackerApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByTestId, getByText, queryByText, getByLabelText } = renderContainer();

      const saveAsDraftButton = await getByTestId('project-save-draft-button');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save-button'));

      await waitFor(() => {
        expect(mockRestorationTrackerApi().draft.createDraft).toHaveBeenCalledWith(
          'draft name',
          expect.any(Object)
        );

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });

      fireEvent.click(getByTestId('project-save-draft-button'));

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save-button'));

      await waitFor(() => {
        expect(mockRestorationTrackerApi().draft.updateDraft).toHaveBeenCalledWith(
          1,
          'draft name',
          expect.any(Object)
        );

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('calls the createDraft/updateDraft functions with WIP form data', async () => {
      mockRestorationTrackerApi().draft.createDraft.mockResolvedValue({
        id: 1,
        date: '2021-01-20'
      });

      const { getByTestId, getByText, queryByText, getByLabelText } = renderContainer();

      // wait for initial page to load
      await waitFor(() => {
        expect(getByText('Create Restoration Project')).toBeVisible();
      });

      // update project name field
      fireEvent.change(getByLabelText('Project Name *'), {
        target: { value: 'draft project name' }
      });

      const saveAsDraftButton = await getByTestId('project-save-draft-button');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save-button'));

      await waitFor(() => {
        expect(mockRestorationTrackerApi().draft.createDraft).toHaveBeenCalledWith('draft name', {
          contact: { contacts: [] },
          permit: {
            permits: [{ permit_number: '', permit_type: '' }]
          },
          project: {
            start_date: '',
            end_date: '',
            objectives: '',
            project_name: 'draft project name'
          },
          location: { geometry: [], priority: 'false', region: '' },
          funding: { fundingSources: [] },
          partnership: { partnerships: [] },
          species: { focal_species: [] }
        });

        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });

    it('renders an error dialog if the draft submit request fails', async () => {
      mockRestorationTrackerApi().draft.createDraft.mockImplementation(() => {
        throw new Error('Draft failed exception!');
      });

      const { getByTestId, getByText, queryByText, getByLabelText } = renderContainer();

      const saveAsDraftButton = await getByTestId('project-save-draft-button');

      fireEvent.click(saveAsDraftButton);

      await waitFor(() => {
        expect(getByText('Save Incomplete Project as a Draft')).toBeVisible();
      });

      fireEvent.change(getByLabelText('Draft Name *'), { target: { value: 'draft name' } });

      fireEvent.click(getByTestId('edit-dialog-save-button'));

      await waitFor(() => {
        expect(queryByText('Save Incomplete Project as a Draft')).not.toBeInTheDocument();
      });
    });
  });
});
