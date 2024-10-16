import { render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { useNertApi } from 'hooks/useNertApi';
import React from 'react';
import ProjectGeneralInformationForm, {
  IProjectGeneralInformationForm,
  ProjectGeneralInformationFormInitialValues,
  ProjectGeneralInformationFormYupSchema
} from './ProjectGeneralInformationForm';

jest.mock('../../../hooks/useNertApi');
const mockuseNertApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

const mockRestorationTrackerApi = (
  useNertApi as unknown as jest.Mock<typeof mockuseNertApi>
).mockReturnValue(mockuseNertApi);

describe.skip('ProjectGeneralInformationForm', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockClear();
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockClear();
  });

  it('renders correctly with default empty values', async () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectGeneralInformationFormInitialValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByTestId('project.project_name')).toBeVisible();
      expect(getByTestId('start_date')).toBeVisible();
      expect(getByTestId('end_date')).toBeVisible();
      expect(getByTestId('project.objectives')).toBeVisible();
    });
  });

  it('renders correctly with existing details values', async () => {
    const existingFormValues: IProjectGeneralInformationForm = {
      project: {
        project_name: 'name 1',
        start_date: '2021-03-14',
        end_date: '2021-04-14',
        objectives: 'my objectives'
      },
      species: {
        focal_species: [1234, 321]
      }
    };

    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByTestId('project.project_name')).toBeVisible();
      expect(getByTestId('start_date')).toBeVisible();
      expect(getByTestId('end_date')).toBeVisible();
      expect(getByTestId('project.objectives')).toBeVisible();
      expect(getByDisplayValue('name 1')).toBeVisible();
      expect(getByDisplayValue('my objectives')).toBeVisible();
    });
  });
});
