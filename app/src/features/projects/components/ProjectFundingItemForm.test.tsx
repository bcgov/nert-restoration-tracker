import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectFundingItemForm, {
  IProjectFundingFormArrayItem,
  ProjectFundingFormArrayItemInitialValues,
  ProjectFundingFormArrayItemYupSchema
} from './ProjectFundingItemForm';

describe('ProjectFundingItemForm', () => {
  it.skip('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectFundingFormArrayItemInitialValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingItemForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with agency 1', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      organization_name: 'string',
      description: 'string',
      funding_project_id: 'string',
      funding_amount: 123,
      start_date: 'string',
      end_date: 'string',
      is_public: 'false'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingItemForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with agency 2', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      organization_name: 'string',
      description: 'string',
      funding_project_id: 'string',
      funding_amount: 123,
      start_date: 'string',
      end_date: 'string',
      is_public: 'false'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingItemForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with any agency other than 1 or 2', () => {
    const existingFormValues: IProjectFundingFormArrayItem = {
      organization_name: 'string',
      description: 'string',
      funding_project_id: 'string',
      funding_amount: 123,
      start_date: 'string',
      end_date: 'string',
      is_public: 'false'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingItemForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe.skip('auto selection of investment action category', () => {
    const component = (
      <Formik
        initialValues={ProjectFundingFormArrayItemInitialValues}
        validationSchema={ProjectFundingFormArrayItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectFundingItemForm />}
      </Formik>
    );

    it('works if an agency_id with a matching NA investment action category is chosen', async () => {
      const { asFragment, getByText, getAllByRole, getByRole } = render(component);

      await waitFor(() => {
        expect(getByText('Agency Details')).toBeInTheDocument();
      });

      fireEvent.mouseDown(getAllByRole('button')[0]);
      const agencyNameListbox = within(getByRole('listbox'));
      fireEvent.click(agencyNameListbox.getByText(/agency 3/i));

      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });

    it('works if an agency_id with a non-matching investment action category is chosen', async () => {
      const { asFragment, getByText, getAllByRole, getByRole } = render(component);

      await waitFor(() => {
        expect(getByText('Agency Details')).toBeInTheDocument();
      });

      fireEvent.mouseDown(getAllByRole('button')[0]);
      const agencyNameListbox = within(getByRole('listbox'));
      fireEvent.click(agencyNameListbox.getByText(/agency 4/i));

      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});
