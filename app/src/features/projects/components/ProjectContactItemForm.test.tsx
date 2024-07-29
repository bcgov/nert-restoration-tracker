import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectContactItemForm, {
  IProjectContactItemForm,
  ProjectContactItemInitialValues,
  ProjectContactItemYupSchema
} from './ProjectContactItemForm';

const agencies = ['Agency 1', 'Agency 2', 'Agency 3'];

describe('ProjectContactItemForm', () => {
  it('renders correctly with default empty values', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectContactItemInitialValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm organization={agencies} />}
      </Formik>
    );

    expect(getByTestId('first_name')).toBeVisible();
    expect(getByTestId('last_name')).toBeVisible();
    expect(getByTestId('email_address')).toBeVisible();
    expect(getByTestId('organization')).toBeVisible();
  });

  it('renders renders correctly with existing values', () => {
    const existingValues: IProjectContactItemForm = {
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'jd@example.com',
      organization: 'A Rocha Canada',
      phone_number: '123-456-7890',
      is_public: 'true',
      is_primary: 'true',
      is_first_nation: true
    };

    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={existingValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm organization={agencies} />}
      </Formik>
    );

    expect(getByTestId('first_name')).toBeVisible();
    expect(getByTestId('last_name')).toBeVisible();
    expect(getByTestId('email_address')).toBeVisible();
    expect(getByTestId('organization')).toBeVisible();
    expect(getByDisplayValue('John')).toBeVisible();
    expect(getByDisplayValue('Doe')).toBeVisible();
    expect(getByDisplayValue('jd@example.com')).toBeVisible();
    expect(getByDisplayValue('A Rocha Canada')).toBeVisible();
  });
});
