import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { S3FileType } from 'constants/attachments';
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

      <H2ButtonToolbar
        aria-label="upload documents"
        label="Documents"
        buttonLabel="Upload"
        buttonTitle="Upload Documents"
        buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
        buttonOnClick={handleUploadAttachmentClick}
        buttonProps={{
          variant: 'outlined'
        }}
      />

      <AttachmentsList
        projectId={projectId}
        attachmentsList={attachmentsList}
        getAttachments={getAttachments}
      />
    </>
  );
};

export default ProjectAttachments;
