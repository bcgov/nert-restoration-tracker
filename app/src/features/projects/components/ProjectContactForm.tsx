import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import ProjectContactItemForm, {
  IProjectContactItemForm,
  IProjectContactItemFormProps,
  ProjectContactItemInitialValues,
  ProjectContactItemYupSchema
} from './ProjectContactItemForm';
import ContactListItem from 'components/contact/ContactItem';

export interface IProjectContactForm {
  contact: {
    contacts: IProjectContactItemForm[];
  };
}

export const ProjectContactInitialValues: IProjectContactForm = {
  contact: {
    contacts: []
  }
};

export const ProjectContactYupSchema = yup.object().shape({
  contact: yup.object().shape({
    contacts: yup
      .array()
      .of(ProjectContactItemYupSchema)
      .min(1, 'You must add at least one Contact')
      .required('Required')
  })
});

export type IProjectContactFormProps = IProjectContactItemFormProps;

/**
 * Create project - contact section
 *
 * @return {*}
 */
const ProjectContactForm: React.FC<IProjectContactFormProps> = ({ organization }) => {
  const { values, errors } = useFormikContext<IProjectContactForm>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tracks information about the contact that is being added/edited
  const [currentProjectContact, setCurrentProjectContact] = useState({
    index: 0,
    values: ProjectContactItemInitialValues
  });

  return (
    <>
      <Box mb={3} maxWidth={'72ch'}>
        <Typography variant="body1" color="textSecondary">
          Specify all contacts for the project.
        </Typography>
      </Box>
      <Box mt={1} mb={2}>
        {errors.contact &&
          errors.contact.contacts &&
          typeof errors.contact.contacts == 'string' && (
            <Typography variant="body2" color="error">
              {errors.contact.contacts}
            </Typography>
          )}
      </Box>
      <Box>
        <FieldArray
          name="contact.contacts"
          render={(arrayHelpers) => (
            <Box mb={2}>
              <EditDialog
                dialogTitle={'Add Contact'}
                open={isModalOpen}
                component={{
                  element: <ProjectContactItemForm organization={organization} />,
                  initialValues: currentProjectContact.values,
                  validationSchema: ProjectContactItemYupSchema
                }}
                onCancel={() => setIsModalOpen(false)}
                onSave={(projectContactValues) => {
                  // If current user is primary, set all other to false
                  if (JSON.parse(projectContactValues.is_primary)) {
                    values.contact.contacts.forEach((item, index) => {
                      if (index !== currentProjectContact.index) {
                        item.is_primary = 'false';
                      }
                    });
                  }

                  projectContactValues.is_primary = String(projectContactValues.is_primary);

                  if (currentProjectContact.index < values.contact.contacts.length) {
                    // Update an existing item
                    arrayHelpers.replace(currentProjectContact.index, projectContactValues);
                  } else {
                    // Add a new item
                    arrayHelpers.push(projectContactValues);
                  }

                  // Close the modal
                  setIsModalOpen(false);
                }}
              />
              <List dense disablePadding>
                {!values.contact.contacts.length && (
                  <ListItem dense component={Paper}>
                    <Box
                      display="flex"
                      flexGrow={1}
                      justifyContent="center"
                      alignContent="middle"
                      p={2}>
                      <Typography variant="subtitle2">No Contacts</Typography>
                    </Box>
                  </ListItem>
                )}
                {values.contact.contacts.map((contact, index) => (
                  <ContactListItem
                    key={index}
                    index={index}
                    contact={contact}
                    arrayHelpers={arrayHelpers}
                    setCurrentContact={setCurrentProjectContact}
                    setIsModalOpen={setIsModalOpen}
                  />
                ))}
              </List>
            </Box>
          )}
        />
      </Box>
      <Button
        variant="outlined"
        color="primary"
        title="Add Contact"
        aria-label="Add Contact"
        startIcon={<Icon path={mdiPlus} size={1}></Icon>}
        data-testid="add-contact-button"
        onClick={() => {
          setCurrentProjectContact({
            index: values.contact.contacts.length,
            values: ProjectContactItemInitialValues
          });
          setIsModalOpen(true);
        }}>
        Add Contact
      </Button>
    </>
  );
};

export default ProjectContactForm;
