import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNertApi } from 'hooks/useNertApi';
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
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);
  const restorationTrackerApi = useNertApi();

  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response =
          await restorationTrackerApi.public.project.getProjectAttachments(projectId);

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
      <Box py={1} px={2} display="flex" justifyContent="space-between">
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
