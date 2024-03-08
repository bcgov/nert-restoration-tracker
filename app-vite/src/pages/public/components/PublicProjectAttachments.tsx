import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicAttachmentsList from './PublicAttachmentsList';

export interface IPublicProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectAttachments: React.FC<IPublicProjectAttachmentsProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(
          projectId
        );

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [attachmentsList.length, restorationTrackerApi.public.project, projectId]
  );

  useEffect(() => {
    getAttachments(false);
  }, []);

  return (
    <Box>
      <Box py={2} px={3} display="flex" justifyContent="space-between">
        <Typography variant="h2">Documents</Typography>
      </Box>

      <Box>
        <PublicAttachmentsList
          projectId={projectId}
          attachmentsList={attachmentsList}
          getAttachments={getAttachments}
        />
      </Box>
    </Box>
  );
};

export default PublicProjectAttachments;
