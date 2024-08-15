import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectFundingForm, {
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from './ProjectFundingForm';

describe('ProjectFundingForm', () => {
  it.skip('renders correctly with default empty values', () => {
    const { baseElement } = render(
      <Formik
        initialValues={ProjectFundingFormInitialValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingForm />}
      </Formik>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it.skip('renders correctly with existing funding values', () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            organization_name: 'name',
            description: 'description',
            funding_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            is_public: 'false'
          }
        ]
      }
    };

    const { baseElement } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingForm />}
      </Formik>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('shows add funding source dialog on add click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            organization_name: 'name',
            description: 'description',
            funding_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            is_public: 'false'
          },
          {
            organization_name: 'name',
            description: 'description',
            funding_project_id: '222',
            funding_amount: 222,
            start_date: '2022-03-24',
            end_date: '2022-04-24',
            is_public: 'false'
          }
        ]
      }
    };

    const { getByTestId, queryByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingForm />}
      </Formik>
    );

    const addButton = getByTestId('add-funding-source-button');

    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(queryByText('Funding Sources')).toBeInTheDocument();
    });
  });

  it.skip('shows edit funding source dialog on edit click', async () => {
    await act(async () => {
      const existingFormValues: IProjectFundingForm = {
        funding: {
          fundingSources: [
            {
              organization_name: 'name',
              description: 'description',
              funding_project_id: '111',
              funding_amount: 222,
              start_date: '2021-03-14',
              end_date: '2021-04-14',
              is_public: 'false'
            }
          ]
        }
      };

      const { getByTestId, getByText, queryByText } = render(
        <Formik
          initialValues={existingFormValues}
          validationSchema={ProjectFundingFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          {() => <ProjectFundingForm />}
        </Formik>
      );

      const editButton = await getByTestId('edit-button-0');
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);

      expect(await queryByText('Funding Sources')).toBeInTheDocument();

      const cancelButton = await getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
      expect(await queryByText('Cancel')).not.toBeInTheDocument();

      fireEvent.click(editButton);
      const saveButton = await getByText('Save Changes');
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(saveButton);
    });
  });

  it.skip('deletes funding source dialog on delete click', async () => {
    await act(async () => {
      const existingFormValues: IProjectFundingForm = {
        funding: {
          fundingSources: [
            {
              organization_name: 'name',
              description: 'description',
              funding_project_id: '111',
              funding_amount: 222,
              start_date: '2021-03-14',
              end_date: '2021-04-14',
              is_public: 'false'
            }
          ]
        }
      };

      const { getByTestId, queryByTestId } = render(
        <Formik
          initialValues={existingFormValues}
          validationSchema={ProjectFundingFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          {() => <ProjectFundingForm />}
        </Formik>
      );

      const deleteButton = await getByTestId('delete-button-0');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);

      expect(await queryByTestId('delete-button-0')).not.toBeInTheDocument();
    });
  });
});
