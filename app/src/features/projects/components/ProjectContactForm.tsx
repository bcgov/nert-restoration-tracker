import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
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
    contacts: yup.array().of(ProjectContactItemYupSchema)
  })
});

export type IProjectContactFormProps = IProjectContactItemFormProps;

const pageStyles = {
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  },
  title: {
    flexGrow: 1,
    marginRight: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 700
  },
  titleDesc: {
    marginLeft: '0.5rem',
    fontWeight: 400
  },
  contactListItem: {
    padding: 0,
    '& + li': {
      marginTop: '1rem'
    }
  },
  contactListItemInner: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden'
  },
  contactListItemToolbar: {
    paddingRight: '1rem'
  }
};

/**
 * Create project - contact section
 *
 * @return {*}
 */
const ProjectContactForm: React.FC<IProjectContactFormProps> = ({ coordinator_agency }) => {
  const { values } = useFormikContext<IProjectContactForm>();

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
      <Box>
        <FieldArray
          name="contact.contacts"
          render={(arrayHelpers) => (
            <Box mb={2}>
              <EditDialog
                dialogTitle={'Add Contact'}
                open={isModalOpen}
                component={{
                  element: <ProjectContactItemForm coordinator_agency={coordinator_agency} />,
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
                      p={2}
                    >
                      <Typography variant="subtitle2">No Contacts</Typography>
                    </Box>
                  </ListItem>
                )}
                {values.contact.contacts.map((contact, index) => (
                  <ListItem dense sx={pageStyles.contactListItem} key={index}>
                    <Paper sx={pageStyles.contactListItemInner}>
                      <Toolbar sx={pageStyles.contactListItemToolbar}>
                        <Typography sx={pageStyles.title}>
                          {`${contact.first_name} ${contact.last_name}`}
                          {JSON.parse(contact.is_primary) && (
                            <Box ml={1} component="sup">
                              <Typography variant="caption" color="textSecondary">
                                Primary
                              </Typography>
                            </Box>
                          )}
                        </Typography>
                        <IconButton
                          color="primary"
                          data-testid={'edit-button-' + index}
                          title="Edit Contact"
                          aria-label="Edit Contact"
                          onClick={() => {
                            setCurrentProjectContact({
                              index: index,
                              values: values.contact.contacts[index]
                            });
                            setIsModalOpen(true);
                          }}
                          size="large"
                        >
                          <Icon path={mdiPencilOutline} size={1} />
                        </IconButton>
                        <IconButton
                          color="primary"
                          data-testid={'delete-button-' + index}
                          title="Remove Contact"
                          aria-label="Remove Contact"
                          onClick={() => arrayHelpers.remove(index)}
                          size="large"
                        >
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Toolbar>
                      <Divider />
                      <Box py={2} px={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" color="textSecondary">
                              Agency
                            </Typography>
                            <Typography variant="body1">{contact.agency}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" color="textSecondary">
                              Email
                            </Typography>
                            <Typography variant="body1">{contact.email_address}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </ListItem>
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
        }}
      >
        Add Contact
      </Button>
    </>
  );
};

export default ProjectContactForm;
