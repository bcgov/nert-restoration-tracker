import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema
} from './BCeIDRequestForm';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';

describe('BCeIDRequestForm', () => {
  it('matches basic bc id view', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={BCeIDBasicRequestFormInitialValues}
        validationSchema={BCeIDBasicRequestFormYupSchema}
        onSubmit={async () => {}}>
        {() => <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC} />}
      </Formik>
    );

    // expect(getByTestId('company')).toBeVisible();
    expect(getByTestId('reason')).toBeVisible();
  });
});
