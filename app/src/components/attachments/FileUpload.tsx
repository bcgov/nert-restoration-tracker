import Box from '@mui/material/Box';
import List from '@mui/material/List';
import React, { ReactElement, useEffect, useState } from 'react';
import { FileError, FileRejection } from 'react-dropzone';
import DropZone, { IDropZoneConfigProps } from './DropZone';
import {
  IFileHandler,
  IOnUploadSuccess,
  IUploadHandler,
  MemoizedFileUploadItem,
  UploadFileStatus
} from './FileUploadItem';

const pageStyles = {
  dropZone: {
    clear: 'both',
    borderRadius: '25px',
    overflow: 'hidden',
    borderStyle: 'dashed',
    borderWidth: '4px',
    borderColor: 'lightgray',
    background: 'white',
    textAlign: 'center',
    transition: 'all ease-out 0.2s',
    '&:hover, &:focus': {
      borderColor: 'darkgray'
    },
    '&.hoverApproved': {
      borderColor: '#00e03c'
    },
    cursor: 'pointer'
  }
};

export interface IUploadFile {
  file: File;
  error?: string;
}

export interface IUploadFileListProps {
  files: IUploadFile[];
}

export type IReplaceHandler = () => void;

export interface IFileUploadProps {
  /**
   * Callback fired for each file in the list
   *
   * @type {IUploadHandler}
   * @memberof IFileUploadProps
   */
  uploadHandler: IUploadHandler;
  /**
   * Callback fired for each accepted file in the list (that do not have any `DropZone` errors (size, count, extension).
   *
   * @type {IFileHandler}
   * @memberof IFileUploadProps
   */
  fileHandler?: IFileHandler;
  /**
   * Callback fired when `uploadHandler` runs successfully fora  given file. Will run once for each file that is
   * uploaded.
   *
   * @type {IOnUploadSuccess}
   * @memberof IFileUploadProps
   */
  onSuccess?: IOnUploadSuccess;
  /**
   * Manually dictate the status.
   *
   * Note: some component events are automatically triggered based on a change of status.
   *
   * @type {UploadFileStatus}
   * @memberof IFileUploadProps
   */
  status?: UploadFileStatus;
  /**
   * If the component should replace the selected files, rather than appending them.
   * Default: false
   *
   * Example:
   * - WIth replace=false, selecting FileA and then selecting FileB will result in both FileA and FileB in the upload
   * list.
   * - With replace=true, selecting FileA and then selecting FileB will result in only FileB in the upload list.
   *
   * Note: This will not change how many files are uploaded, only how many files appear in the list. So if
   * a file is in the middle of uploading when it is replaced, that file will still continue to upload even though it
   * is not visible in the upload list.
   *
   * @type {boolean}
   * @memberof IFileUploadProps
   */
  replace?: boolean;
  /**
   * Callback fired when files are replaced.
   *
   * Note: Does nothing if `replace` is not set to `true`.
   *
   * @type {IReplaceHandler}
   * @memberof IFileUploadProps
   */
  onReplace?: IReplaceHandler;
  dropZoneProps?: Partial<IDropZoneConfigProps>;
  errorDetailHandler?: (errors: (string | object)[]) => ReactElement;
}

export const FileUpload: React.FC<IFileUploadProps> = (props) => {
  const [files, setFiles] = useState<IUploadFile[]>([]);

  const [fileUploadItems, setFileUploadItems] = useState<any[]>([]);

  const [fileToRemove, setFileToRemove] = useState<string>('');

  // Check if the file is an approved file type
  const [uploadCheckApproved, setUploadCheckApproved] = useState<boolean>(false);
  const allApprovedExtensions = props.dropZoneProps?.acceptedFileExtensions
    ? Object.entries(props.dropZoneProps.acceptedFileExtensions)
    : [];
  const approvedExtensions = allApprovedExtensions.map((value) => value[0]);

  const checkApproved = (e: any) => {
    const match =
      approvedExtensions.some((extension) => extension === e.dataTransfer.items[0].type) || false;
    setUploadCheckApproved(match);
  };

  const checkLeave = () => setUploadCheckApproved(false);

  /**
   * Handles files which are added (via either drag/drop or browsing).
   *
   * @param {File[]} filesToAdd files that pass the basic DropZone size/quantity/type checks
   * @param {FileRejection[]} rejectedFiles files that did not pass the basic DropZone size/quantity/type checks
   */
  const onFiles = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const newAcceptedFiles: IUploadFile[] = [];
    const newRejectedFiles: IUploadFile[] = [];

    // Parse out any files that have already been added
    acceptedFiles.forEach((item) => {
      const isAlreadyAdded = files.some((existingFile) => existingFile.file.name === item.name);

      if (isAlreadyAdded) {
        return;
      }

      newAcceptedFiles.push({
        file: item
      });
    });

    // Parse out any rejected files that have already been added
    rejectedFiles.forEach((item) => {
      const isAlreadyRejected = files.some(
        (existingFile) => existingFile.file.name === item.file.name
      );

      if (isAlreadyRejected) {
        return;
      }

      newRejectedFiles.push({
        file: item.file,
        error: getErrorCodeMessage(item.errors[0])
      });
    });

    if (props.replace) {
      // Replace current files with new files
      setFiles([...newAcceptedFiles, ...newRejectedFiles]);
      setFileUploadItems([
        ...newAcceptedFiles.map((item) => getFileUploadItem(item.file, item.error)),
        ...newRejectedFiles.map((item) => getFileUploadItem(item.file, item.error))
      ]);
      props.onReplace?.();
    } else {
      // Append new files to current files
      setFiles((currentFiles) => [...currentFiles, ...newAcceptedFiles, ...newRejectedFiles]);
      setFileUploadItems(
        fileUploadItems.concat([
          ...newAcceptedFiles.map((item) => getFileUploadItem(item.file, item.error)),
          ...newRejectedFiles.map((item) => getFileUploadItem(item.file, item.error))
        ])
      );
    }
  };

  const getFileUploadItem = (file: File, error?: string) => {
    return (
      <MemoizedFileUploadItem
        key={file.name}
        uploadHandler={props.uploadHandler}
        onSuccess={props.onSuccess}
        file={file}
        error={error}
        onCancel={() => setFileToRemove(file.name)}
        fileHandler={props.fileHandler}
        status={props.status}
        errorDetailHandler={props.errorDetailHandler}
      />
    );
  };

  const getErrorCodeMessage = (fileError: FileError) => {
    switch (fileError.code) {
      case 'file-too-large':
        return 'File size exceeds maximum';
      case 'too-many-files':
        return 'Number of files uploaded at once exceeds maximum';
      case 'file-invalid-type':
        return 'File type is not compatible';
      default:
        return 'Encountered an unexpected error';
    }
  };

  useEffect(() => {
    if (!fileToRemove) {
      return;
    }

    const removeFile = (fileName: string) => {
      const index = files.findIndex((item) => item.file.name === fileName);

      if (index === -1) {
        return;
      }

      setFiles((currentFiles) => {
        const newFiles = [...currentFiles];
        newFiles.splice(index, 1);
        return newFiles;
      });

      setFileUploadItems((currentFileUploadItems) => {
        const newFileUploadItems = [...currentFileUploadItems];
        newFileUploadItems.splice(index, 1);
        return newFileUploadItems;
      });

      setFileToRemove('');
    };

    removeFile(fileToRemove);
  }, [fileToRemove, fileUploadItems, files]);

  return (
    <Box>
      <Box
        sx={pageStyles.dropZone}
        onDragOver={checkApproved}
        onDragLeave={checkLeave}
        className={uploadCheckApproved ? 'hoverApproved' : ''}>
        <DropZone onFiles={onFiles} {...props.dropZoneProps} />
      </Box>
      <Box>
        <List>{fileUploadItems}</List>
      </Box>
    </Box>
  );
};

export default FileUpload;
