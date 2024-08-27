import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { ActionToolbar } from 'components/toolbar/ActionToolbars';
import { S3FileType } from 'constants/attachments';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { useNertApi } from 'hooks/useNertApi';
import {
  IGetProjectAttachment,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectAttachmentsProps {
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = (props) => {
  const { attachmentsList, getAttachments } = props;
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);
  const restorationTrackerApi = useNertApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);

  const handleUploadAttachmentClick = () => setOpenUploadAttachments(true);

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken) => {
      return restorationTrackerApi.project.uploadProjectAttachments(
        projectId,
        file,
        S3FileType.ATTACHMENTS,
        cancelToken
      );
    };
  };

  return (
    <>
      <ComponentDialog
        open={openUploadAttachments}
        dialogTitle="Upload Documents"
        onClose={() => {
          setOpenUploadAttachments(false);
          getAttachments(true);
        }}>
        <FileUpload uploadHandler={getUploadHandler()} />
      </ComponentDialog>

      <ProjectRoleGuard
        validProjectRoles={[
          PROJECT_ROLE.PROJECT_LEAD,
          PROJECT_ROLE.PROJECT_EDITOR,
          PROJECT_ROLE.PROJECT_VIEWER
        ]}
        validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.MAINTAINER]}>
        <ActionToolbar label={'Documents'} labelProps={{ variant: 'h2' }}>
          <Button
            id={'upload-documents'}
            data-testid={'upload-documents'}
            variant="outlined"
            color="primary"
            title={'Upload Documents'}
            aria-label={'Upload Documents'}
            startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
            onClick={() => handleUploadAttachmentClick()}>
            Upload
          </Button>
        </ActionToolbar>
      </ProjectRoleGuard>

      <AttachmentsList
        projectId={projectId}
        attachmentsList={attachmentsList}
        getAttachments={getAttachments}
      />
    </>
  );
};

export default ProjectAttachments;
