import { fireEvent, render, waitFor } from '@testing-library/react';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface ISampleFormikFormProps {
  testField: string;
}

export const SampleFormikFormYupSchema = yup.object().shape({
  testField: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide a test field for the project')
});

const SampleFormikForm = () => {
  const formikProps = useFormikContext<ISampleFormikFormProps>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <CustomTextField
        name="testField"
        label="Test Field"
        other={{ multiline: true, required: true, rows: 4 }}
      />
    </form>
  );
};

const handleOnSave = jest.fn();
const handleOnCancel = jest.fn();

const renderContainer = ({
  testFieldValue,
  dialogError,
  open = true
}: {
  testFieldValue: string;
  dialogError?: string;
  open?: boolean;
}) => {
  return render(
    <div id="root">
      <EditDialog
        dialogTitle="This is dialog title"
        dialogError={dialogError || undefined}
        open={open}
        component={{
          element: <SampleFormikForm />,
          initialValues: { testField: testFieldValue },
          validationSchema: SampleFormikFormYupSchema
        }}
        onCancel={handleOnCancel}
        onSave={handleOnSave}
      />
    </div>
  );
};

describe('EditDialog', () => {
  it('renders component and data values', () => {
    const { getByTestId, getByText } = renderContainer({ testFieldValue: 'this is a test' });

    expect(getByTestId('testField')).toBeVisible();
    expect(getByText('this is a test')).toBeVisible();
  });

  it('matches when open, with error message', () => {
    const { getByTestId, getByText } = renderContainer({
      testFieldValue: 'this is a test',
      dialogError: 'This is an error'
    });

    expect(getByTestId('testField')).toBeVisible();
    expect(getByText('This is an error')).toBeVisible();
  });

  it('calls the onCancel prop when `Cancel` button is clicked', async () => {
    const { findByText } = renderContainer({ testFieldValue: 'this is a test' });

    const cancelButton = await findByText('Cancel', { exact: false });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(handleOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
