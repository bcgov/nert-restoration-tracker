import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicAttachmentsList from './PublicAttachmentsList';

export interface IPublicProjectAttachmentsProps {
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

/**
 * Project attachments content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectAttachments: React.FC<IPublicProjectAttachmentsProps> = (props) => {
  const { attachmentsList, getAttachments } = props;

  return (
    <Box>
      <Box py={1} px={2} display="flex" justifyContent="space-between">
        <Typography variant="h2">Documents</Typography>
      </Box>

      <Box>
        <PublicAttachmentsList attachmentsList={attachmentsList} getAttachments={getAttachments} />
      </Box>
    </Box>
  );
};

export default PublicProjectAttachments;
