import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPublicProjectContactProps {
  projectForViewData: IGetProjectForViewResponse | IGetPlanForViewResponse;
  refresh: () => void;
}

/**
 * Project contact content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectContact: React.FC<IPublicProjectContactProps> = ({ projectForViewData }) => {
  const { contact } = projectForViewData;

  const hasContacts = contact.contacts && contact.contacts.length > 0;

  return (
    <>
      {hasContacts &&
        contact.contacts.map((contactDetails, index) => (
          <Box my={1} key={index}>
            <Card sx={{ borderRadius: '10px' }} data-testid={'contact-card'}>
              <CardHeader
                avatar={
                  <Avatar aria-label="contact">
                    {contactDetails.first_name
                      ? contactDetails.first_name[0] + contactDetails.last_name[0]
                      : 'FN'}
                  </Avatar>
                }
                title={`${contactDetails.first_name} ${contactDetails.last_name}`}
                subheader={
                  <Grid container>
                    <Grid item xs={6}>
                      <Link href={'mailto:' + contactDetails.email_address}>
                        {contactDetails.email_address}
                      </Link>
                      <Box>{contactDetails.phone_number}</Box>
                    </Grid>
                    <Grid item xs={6} textAlign={'center'}>
                      {contactDetails.is_primary === 'true' ? (
                        <Box>
                          <Chip size="small" label="PRIMARY" />
                        </Box>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  </Grid>
                }
                data-testid="contact_name"
              />
              <CardContent sx={{ my: -2 }}>
                <Typography variant="body2" color="text.secondary">
                  <b>Organization:</b> {contactDetails.organization}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}

      {!hasContacts && (
        <Typography variant="body2" color="textSecondary" data-testid="no_contacts">
          No Contacts
        </Typography>
      )}
    </>
  );
};

export default PublicProjectContact;
