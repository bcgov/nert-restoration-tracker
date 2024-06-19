import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { IPlanContactItemForm } from 'features/plans/components/PlanContactItemForm';
import { FieldArrayRenderProps } from 'formik';
import React from 'react';

export interface IContactListItem {
  contact: IPlanContactItemForm;
  index: number;
  arrayHelpers: FieldArrayRenderProps;
  setCurrentContact: (contact: { index: number; values: IPlanContactItemForm }) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

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
 * Create Plan - contact section
 *
 * @return {*}
 */
const ContactListItem: React.FC<IContactListItem> = (props) => {
  return (
    <ListItem dense sx={pageStyles.contactListItem} key={props.index}>
      <Paper sx={pageStyles.contactListItemInner}>
        <Toolbar sx={pageStyles.contactListItemToolbar}>
          <Typography sx={pageStyles.title}>
            {`${props.contact.first_name} ${props.contact.last_name}`}
            {JSON.parse(props.contact.is_primary) && (
              <Box ml={1} component="sup">
                <Typography variant="caption" color="textSecondary">
                  Primary
                </Typography>
              </Box>
            )}
          </Typography>
          <IconButton
            color="primary"
            data-testid={'edit-button-' + props.index}
            title="Edit Contact"
            aria-label="Edit Contact"
            onClick={() => {
              props.setCurrentContact({
                index: props.index,
                values: props.contact
              });
              props.setIsModalOpen(true);
            }}
            size="large">
            <Icon path={mdiPencilOutline} size={1} />
          </IconButton>
          <IconButton
            color="primary"
            data-testid={'delete-button-' + props.index}
            title="Remove Contact"
            aria-label="Remove Contact"
            onClick={() => props.arrayHelpers.remove(props.index)}
            size="large">
            <Icon path={mdiTrashCanOutline} size={1} />
          </IconButton>
        </Toolbar>
        <Divider />
        <Box py={2} px={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">
                Organization
              </Typography>
              <Typography variant="body1">{props.contact.organization}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{props.contact.email_address}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </ListItem>
  );
};

export default ContactListItem;
