import { AxiosInstance } from 'axios';
import { S3FileType } from 'constants/attachments';
import {
  IDraftResponse,
  IGetDraftResponse,
  IGetDraftsListResponse
} from 'interfaces/useDraftApi.interface';

/**
 * Returns a set of supported api methods for working with drafts.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useDraftApi = (axios: AxiosInstance) => {
  /**
   * Create a new draft record.
   *
   * @param {boolean} draftIsProject
   * @param {string} draftName
   * @param {unknown} draftData
   * @return {*}  {Promise<IDraftResponse>}
   */
  const createDraft = async (
    draftIsProject: boolean,
    draftName: string,
    draftData: any
  ): Promise<IDraftResponse> => {
    //remove the image file off project json
    const projectImage = draftData.project.project_image;
    draftData.project.project_image = null;

    const { data } = await axios.post('/api/draft', {
      is_project: draftIsProject,
      name: draftName,
      data: draftData
    });

    // upload the image file if it exists
    if (projectImage) {
      await uploadDraftAttachments(data.id, projectImage, S3FileType.DRAFT);
    }
    return data;
  };

  /**
   * Upload project attachments.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadDraftAttachments = async (
    draftId: number,
    file: File,
    fileType: string
  ): Promise<void> => {
    const req_message = new FormData();

    req_message.append('media', file);
    req_message.append('fileType', fileType);

    const { data } = await axios.post(`/api/draft/${draftId}/attachments/upload`, req_message);

    return data;
  };

  /**
   * Update a draft record.
   *
   * @param {number} id
   * @param {string} draftName
   * @param {unknown} draftData
   * @return {*}  {Promise<IDraftResponse>}
   */
  const updateDraft = async (
    id: number,
    draftName: string,
    draftData: any
  ): Promise<IDraftResponse> => {
    //remove the image file off project json
    const projectImage = draftData.project.project_image;
    draftData.project.project_image = null;

    const { data } = await axios.put('/api/draft', {
      id: id,
      name: draftName,
      data: draftData
    });

    // upload the image file if it exists
    if (projectImage) {
      await uploadDraftAttachments(data.id, projectImage, S3FileType.DRAFT);
    }
    return data;
  };

  /**
   * Get drafts list.
   *
   * @return {*}  {Promise<IGetDraftsListResponse[]>}
   */
  const getDraftsList = async (): Promise<IGetDraftsListResponse[]> => {
    const { data } = await axios.get(`/api/draft`);

    return data;
  };

  /**
   * Get a user drafts list.
   *
   * @return {*}  {Promise<IGetDraftsListResponse[]>}
   */
  const getUserDraftsList = async (userId: number): Promise<IGetDraftsListResponse[]> => {
    const { data } = await axios.get(`/api/draft/${userId}/list`);

    return data;
  };

  /**
   * Get details for a single draft based on its id.
   *
   * @return {*} {Promise<IGetDraftResponse>}
   */
  const getDraft = async (draftId: number): Promise<IGetDraftResponse> => {
    const { data } = await axios.get(`/api/draft/${draftId}/get`);

    return data;
  };

  /**
   * Delete a single draft based on its id.
   *
   * @return {*} {Promise<any>}
   */
  const deleteDraft = async (draftId: number): Promise<any> => {
    const { data } = await axios.delete(`api/draft/${draftId}/delete`);

    return data;
  };

  return {
    createDraft,
    updateDraft,
    getDraftsList,
    getUserDraftsList,
    getDraft,
    deleteDraft
  };
};

export default useDraftApi;
