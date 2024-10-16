import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IPlanDraftForm {
  draft_name: string;
}

export const PlanDraftFormInitialValues: IPlanDraftForm = {
  draft_name: ''
};

export const PlanDraftFormYupSchema = yup.object().shape({
  draft_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required')
});

/**
 * Create Plan - Draft form
 *
 * @return {*}
 */
const PlanDraftForm: React.FC = () => {
  const formikProps = useFormikContext<IPlanDraftForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit} aria-labelledby="draft-form-title">
      <CustomTextField
        name="draft_name"
        label="Draft Name"
        other={{
          required: true
        }}
        aria-required="true"
      />
    </form>
  );
};

export default PlanDraftForm;
