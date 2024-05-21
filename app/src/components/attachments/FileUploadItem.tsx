import { mdiCheck, mdiFileOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import axios, { CancelTokenSource } from 'axios';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { APIError } from 'hooks/api/useAxios';
import useIsMounted from 'hooks/useIsMounted';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

const pageStyles = {
  uploadProgress: {
    marginTop: '0.3rem'
  },
  uploadListItemBox: {
    width: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'gray',
    borderRadius: '4px'
  },
  uploadingColor: {
    color: 'blue'
  },
  completeColor: {
    color: 'gray'
  },
  completeBgColor: {
    background: 'lightgray'
  },
  errorColor: {
    color: 'red'
  },
  errorBgColor: {
    background: 'lightorange'
  },
  fileIconColor: {
    color: 'gray'
  }
};

export enum UploadFileStatus {
  STAGED = 'Ready for upload',
  PENDING = 'Pending',
  UPLOADING = 'Uploading',
  FINISHING_UPLOAD = 'Finishing upload',
  FAILED = 'Failed',
  COMPLETE = 'Complete'
}

export interface IUploadFile {
  file: File;
  status: UploadFileStatus;
  progress: number;
  cancelTokenSource: CancelTokenSource;
  error?: string;
}

export type IUploadHandler<T = any> = (
  file: File,
  cancelToken: CancelTokenSource,
  handleFileUploadProgress: (progressEvent: ProgressEvent) => void
) => Promise<T>;

export type IFileHandler = (file: File | null) => void;

export type IOnUploadSuccess = (response: any) => void;

export interface IFileUploadItemProps {
  uploadHandler: IUploadHandler;
  onSuccess?: IOnUploadSuccess;
  file: File;
  error?: string;
  onCancel: () => void;
  fileHandler?: IFileHandler;
  status?: UploadFileStatus;
  errorDetailHandler?: (errors: (string | object)[]) => ReactElement;
}

const FileUploadItem: React.FC<IFileUploadItemProps> = (props) => {
  const isMounted = useIsMounted();

  const { uploadHandler, fileHandler, onSuccess } = props;

  const [file] = useState<File>(props.file);

  const [errors, setErrors] = useState<(string | object)[]>();
  const [openDialog, setOpenDialog] = useState(false);

  const [error, setError] = useState<string | undefined>(props.error);

  const [status, setStatus] = useState<UploadFileStatus>(props.status || UploadFileStatus.PENDING);
  const [progress, setProgress] = useState<number>(0);
  const [cancelToken] = useState<CancelTokenSource>(axios.CancelToken.source());

  // indicates that the active requests should cancel
  const [initiateCancel, setInitiateCancel] = useState<boolean>(false);
  // indicates that the active requests are in a state where they can be safely cancelled
  const [isSafeToCancel, setIsSafeToCancel] = useState<boolean>(false);

  const handleFileUploadError = useCallback(() => {
    setStatus(UploadFileStatus.FAILED);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (error) {
      handleFileUploadError();
      return;
    }

    fileHandler?.(file);

    if (status !== UploadFileStatus.PENDING) {
      return;
    }

    const handleFileUploadProgress = (progressEvent: ProgressEvent) => {
      if (!isMounted()) {
        // component is unmounted, don't perform any state changes when the upload request emits progress
        return;
      }

      setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));

      if (progressEvent.loaded === progressEvent.total) {
        setStatus(UploadFileStatus.FINISHING_UPLOAD);
      }
    };

    const handleFileUploadSuccess = (response?: any) => {
      if (!isMounted()) {
        // component is unmounted, don't perform any state changes when the upload request resolves
        return;
      }

      setStatus(UploadFileStatus.COMPLETE);
      setProgress(100);

      // the upload request has finished and its safe to call the onCancel prop
      setIsSafeToCancel(true);

      onSuccess?.(response);
    };

    uploadHandler(file, cancelToken, handleFileUploadProgress)
      .then(handleFileUploadSuccess, (error: APIError) => {
        setErrors(error?.errors);
        setError(error?.message);
      })
      .catch();

    setStatus(UploadFileStatus.UPLOADING);
  }, [
    file,
    status,
    cancelToken,
    uploadHandler,
    fileHandler,
    onSuccess,
    isMounted,
    initiateCancel,
    error,
    handleFileUploadError
  ]);

  useEffect(() => {
    if (!isMounted()) {
      // component is unmounted, don't perform any state changes when the upload request rejects
      return;
    }

    if (error && !initiateCancel && !isSafeToCancel) {
      // the api request will reject if it is cancelled OR if it fails, so only conditionally treat the upload as a failure
      handleFileUploadError();
    }

    // the upload request has finished (either from failing or cancelling) and its safe to call the onCancel prop
    setIsSafeToCancel(true);
  }, [error, initiateCancel, isSafeToCancel, isMounted, handleFileUploadError]);

  useEffect(() => {
    if (!initiateCancel) {
      return;
    }

    // cancel the active request
    cancelToken.cancel();
  }, [initiateCancel, cancelToken]);

  useEffect(() => {
    if (!isSafeToCancel || !initiateCancel) {
      return;
    }

    // trigger the parents onCancel hook, as this component is in a state where it can be safely cancelled
    props.onCancel();
    props.fileHandler?.(null);
  }, [initiateCancel, isSafeToCancel, props]);

  return (
    <ListItem key={file.name} disableGutters>
      <Box sx={pageStyles.uploadListItemBox}>
        <Box display="flex" flexDirection="row" alignItems="center" p={2} width="100%">
          <Icon
            path={mdiFileOutline}
            size={1.5}
            color={error ? pageStyles.errorColor.color : pageStyles.fileIconColor.color}
          />
          <Box pl={1.5} flex="1 1 auto">
            <Box
              display="flex"
              flexDirection="row"
              flex="1 1 auto"
              alignItems="center"
              height="3rem"
            >
              <Box flex="1 1 auto">
                <Typography variant="body2" component="div">
                  <strong>{file.name}</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  {error || status}
                </Typography>
              </Box>

              {errors && props.errorDetailHandler && (
                <Box display="flex" alignItems="center">
                  <Button sx={pageStyles.errorColor} onClick={() => setOpenDialog(!openDialog)}>
                    View Details
                  </Button>
                  <ComponentDialog
                    open={openDialog}
                    dialogTitle="Treatment File Errors"
                    onClose={() => setOpenDialog(false)}
                  >
                    {props.errorDetailHandler(errors)}
                  </ComponentDialog>
                </Box>
              )}
              <Box display="flex" alignItems="center">
                <MemoizedActionButton status={status} onCancel={() => setInitiateCancel(true)} />
              </Box>
            </Box>
            <MemoizedProgressBar status={status} progress={progress} />
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

export default FileUploadItem;

export const MemoizedFileUploadItem = React.memo(FileUploadItem, (prevProps, nextProps) => {
  return prevProps.file.name === nextProps.file.name;
});

interface IActionButtonProps {
  status: UploadFileStatus;
  onCancel: () => void;
}

/**
 * Upload action button.
 *
 * Changes color and icon depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const ActionButton: React.FC<IActionButtonProps> = (props) => {
  if (props.status === UploadFileStatus.PENDING || props.status === UploadFileStatus.STAGED) {
    return (
      <IconButton
        title="Remove File"
        aria-label="remove file"
        onClick={() => props.onCancel()}
        size="large"
      >
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  if (props.status === UploadFileStatus.UPLOADING) {
    return (
      <IconButton
        title="Cancel Upload"
        aria-label="cancel upload"
        onClick={() => props.onCancel()}
        size="large"
      >
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <Box display="flex" alignItems="center" p={'12px'}>
        <Icon path={mdiCheck} size={1} color={pageStyles.completeColor.color} />
      </Box>
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <IconButton
        title="Remove File"
        aria-label="remove file"
        onClick={() => props.onCancel()}
        sx={pageStyles.errorColor}
        size="large"
      >
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  // status is FINISHING_UPLOAD, show no action button
  return <Box width="4rem" />;
};

export const MemoizedActionButton = React.memo(ActionButton, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status;
});

interface IProgressBarProps {
  status: UploadFileStatus;
  progress: number;
}

/**
 * Upload progress bar.
 *
 * Changes color and style depending on the status.
 *
 * @param {*} props
 * @return {*}
 */
const ProgressBar: React.FC<IProgressBarProps> = (props) => {
  if (props.status === UploadFileStatus.STAGED) {
    return <></>;
  }

  if (props.status === UploadFileStatus.FINISHING_UPLOAD) {
    return (
      <LinearProgress
        variant="indeterminate"
        sx={pageStyles.uploadProgress}
        classes={{
          colorPrimary: pageStyles.uploadingColor.color,
          barColorPrimary: pageStyles.uploadingColor.color
        }}
      />
    );
  }

  if (props.status === UploadFileStatus.COMPLETE) {
    return (
      <LinearProgress
        variant="determinate"
        value={100}
        sx={pageStyles.uploadProgress}
        classes={{
          colorPrimary: pageStyles.completeBgColor.background,
          barColorPrimary: pageStyles.completeBgColor.background
        }}
      />
    );
  }

  if (props.status === UploadFileStatus.FAILED) {
    return (
      <LinearProgress
        variant="determinate"
        value={0}
        sx={pageStyles.uploadProgress}
        classes={{
          colorPrimary: pageStyles.errorBgColor.background,
          barColorPrimary: pageStyles.errorBgColor.background
        }}
      />
    );
  }

  // status is PENDING or UPLOADING
  return (
    <LinearProgress
      variant="determinate"
      value={props.progress}
      sx={pageStyles.uploadProgress}
      classes={{
        colorPrimary: pageStyles.uploadingColor.color,
        barColorPrimary: pageStyles.uploadingColor.color
      }}
    />
  );
};

export const MemoizedProgressBar = React.memo(ProgressBar, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status && prevProps.progress === nextProps.progress;
});
