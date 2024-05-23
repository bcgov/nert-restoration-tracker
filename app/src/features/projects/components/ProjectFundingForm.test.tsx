import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectFundingForm, {
  IInvestmentActionCategoryOption,
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from './ProjectFundingForm';

const fundingSources: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'agency 1'
  },
  {
    value: 2,
    label: 'agency 2'
  },
  {
    value: 3,
    label: 'agency 3'
  }
];

const investment_action_category: IInvestmentActionCategoryOption[] = [
  {
    value: 1,
    fs_id: 1,
    label: 'action 1'
  },
  {
    value: 2,
    fs_id: 2,
    label: 'category 1'
  },
  {
    value: 3,
    fs_id: 3,
    label: 'not applicable'
  }
];

describe('ProjectFundingForm', () => {
  it.skip('renders correctly with default empty values', () => {
    const { baseElement } = render(
      <Formik
        initialValues={ProjectFundingFormInitialValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectFundingForm
            fundingSources={fundingSources}
            investment_action_category={investment_action_category}
          />
        )}
      </Formik>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it.skip('renders correctly with existing funding values', () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_name: 'agency_name',
            agency_id: 1,
            investment_action_category: 1,
            investment_action_category_name: 'Action 23',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
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
        {() => (
          <ProjectFundingForm
            fundingSources={codes.funding_source.map((item) => {
              return { value: item.id, label: item.name };
            })}
            investment_action_category={codes.investment_action_category.map((item) => {
              return { value: item.id, label: item.name, fs_id: item.fs_id };
            })}
          />
        )}
      </Formik>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('shows add funding source dialog on add click', async () => {
    const existingFormValues: IProjectFundingForm = {
      funding: {
        fundingSources: [
          {
            id: 11,
            agency_id: 1,
            agency_name: 'agency_name',
            investment_action_category: 1,
            investment_action_category_name: 'action 1',
            agency_project_id: '111',
            funding_amount: 222,
            start_date: '2021-03-14',
            end_date: '2021-04-14',
            revision_count: 23
          },
          {
            id: 12,
            agency_id: 2,
            agency_name: 'agency_name',
            investment_action_category: 2,
            investment_action_category_name: 'category 1',
            agency_project_id: '112',
            funding_amount: 223,
            start_date: '2021-03-15',
            end_date: '2021-04-15',
            revision_count: 24
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
        {() => (
          <ProjectFundingForm
            fundingSources={codes.funding_source.map((item) => {
              return { value: item.id, label: item.name };
            })}
            investment_action_category={codes.investment_action_category.map((item) => {
              return { value: item.id, label: item.name, fs_id: item.fs_id };
            })}
          />
        )}
      </Formik>
    );

    const addButton = getByTestId('add-funding-source-button');

    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(queryByText('Agency Details')).toBeInTheDocument();
    });
  });

  it.skip('shows edit funding source dialog on edit click', async () => {
    await act(async () => {
      const existingFormValues: IProjectFundingForm = {
        funding: {
          fundingSources: [
            {
              id: 11,
              agency_id: 1,
              agency_name: 'agency name',
              investment_action_category: 1,
              investment_action_category_name: 'action 1',
              agency_project_id: '111',
              funding_amount: 222,
              start_date: '2021-03-14',
              end_date: '2021-04-14',
              revision_count: 23
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
          {() => (
            <ProjectFundingForm
              fundingSources={codes.funding_source.map((item) => {
                return { value: item.id, label: item.name };
              })}
              investment_action_category={codes.investment_action_category.map((item) => {
                return { value: item.id, label: item.name, fs_id: item.fs_id };
              })}
            />
          )}
        </Formik>
      );

      const editButton = await getByTestId('edit-button-0');
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);

      expect(await queryByText('Agency Details')).toBeInTheDocument();

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
              id: 11,
              agency_id: 1,
              agency_name: 'agency_name',
              investment_action_category: 1,
              investment_action_category_name: 'action 1',
              agency_project_id: '111',
              funding_amount: 222,
              start_date: '2021-03-14',
              end_date: '2021-04-14',
              revision_count: 23
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
          {() => (
            <ProjectFundingForm
              fundingSources={codes.funding_source.map((item) => {
                return { value: item.id, label: item.name };
              })}
              investment_action_category={codes.investment_action_category.map((item) => {
                return { value: item.id, label: item.name, fs_id: item.fs_id };
              })}
            />
          )}
        </Formik>
      );

      const deleteButton = await getByTestId('delete-button-0');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);

      expect(await queryByTestId('delete-button-0')).not.toBeInTheDocument();
    });
  });
});
