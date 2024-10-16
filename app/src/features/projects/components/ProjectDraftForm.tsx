import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectDraftForm {
  draft_name: string;
}

export const ProjectDraftFormInitialValues: IProjectDraftForm = {
  draft_name: ''
};

export const ProjectDraftFormYupSchema = yup.object().shape({
  draft_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required')
});

/**
 * Create Project - Draft form
 *
 * @return {*}
 */
const ProjectDraftForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectDraftForm>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit} aria-labelledby="draft-name-label">
      <CustomTextField
        name="draft_name"
        label="Draft Name"
        other={{
          required: true,
          'aria-label': 'Draft Name'
        }}
      />
    </form>
  );
};

export default ProjectDraftForm;
