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
import PlanContactItemForm, {
  IPlanContactItemForm,
  PlanContactItemInitialValues,
  PlanContactItemYupSchema
} from './PlanContactItemForm';
import ContactListItem from 'components/contact/ContactItem';

export interface IPlanContactForm {
  contact: {
    contacts: IPlanContactItemForm[];
  };
}

export const PlanContactInitialValues: IPlanContactForm = {
  contact: {
    contacts: []
  }
};

export const PlanContactYupSchema = yup.object().shape({
  contact: yup.object().shape({
    contacts: yup
      .array()
      .of(PlanContactItemYupSchema)
      .min(1, 'You must add at least one Contact')
      .required('Required')
  })
});

/**
 * Create Plan - contact section
 *
 * @return {*}
 */
const PlanContactForm: React.FC = () => {
  const { values, errors } = useFormikContext<IPlanContactForm>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tracks information about the contact that is being added/edited
  const [currentPlanContact, setCurrentPlanContact] = useState({
    index: 0,
    values: PlanContactItemInitialValues
  });

  return (
    <>
      <Box mb={3}>
        <Typography variant="body1" color="textSecondary">
          Specify all contacts for the Plan.
        </Typography>
        <Box mt={1} mb={2}>
          {errors.contact &&
            errors.contact.contacts &&
            typeof errors.contact.contacts == 'string' && (
              <Typography variant="body2" color="error">
                {errors.contact.contacts}
              </Typography>
            )}
        </Box>

        <FieldArray
          name="contact.contacts"
          render={(arrayHelpers) => (
            <Box mb={2}>
              <EditDialog
                dialogTitle={'Add Contact'}
                open={isModalOpen}
                component={{
                  element: <PlanContactItemForm />,
                  initialValues: currentPlanContact.values,
                  validationSchema: PlanContactItemYupSchema
                }}
                onCancel={() => setIsModalOpen(false)}
                onSave={(PlanContactValues) => {
                  // If current user is primary, set all other to false
                  if (JSON.parse(PlanContactValues.is_primary)) {
                    values.contact.contacts.forEach((item, index) => {
                      if (index !== currentPlanContact.index) {
                        item.is_primary = 'false';
                      }
                    });
                  }

                  PlanContactValues.is_primary = String(PlanContactValues.is_primary);

                  if (currentPlanContact.index < values.contact.contacts.length) {
                    // Update an existing item
                    arrayHelpers.replace(currentPlanContact.index, PlanContactValues);
                  } else {
                    // Add a new item
                    arrayHelpers.push(PlanContactValues);
                  }

                  // Close the modal
                  setIsModalOpen(false);
                }}
              />
              <List dense disablePadding aria-label="Contact List">
                {!values.contact.contacts.length && (
                  <ListItem dense component={Paper} role="listitem">
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
                    setCurrentContact={setCurrentPlanContact}
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
          setCurrentPlanContact({
            index: values.contact.contacts.length,
            values: PlanContactItemInitialValues
          });
          setIsModalOpen(true);
        }}>
        Add Contact
      </Button>
    </>
  );
};

export default PlanContactForm;
