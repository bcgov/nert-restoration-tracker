import { AxiosInstance, CancelTokenSource } from 'axios';
import { S3FileType } from 'constants/attachments';
import {
  ICreatePlanRequest,
  ICreatePlanResponse,
  IEditPlanRequest,
  IEditPlanResponse,
  IGetPlanForEditResponse,
  IGetPlanForViewResponse,
  IGetUserPlansListResponse,
  IPlanAdvancedFilterRequest
} from 'interfaces/usePlanApi.interface';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with Plans.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const usePlanApi = (axios: AxiosInstance) => {
  /**
   * Get all role and Plan ids for all Plans a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetPlansListResponse[]>}
   */
  const getAllUserPlansParticipation = async (
    userId: number
  ): Promise<IGetUserPlansListResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/plan/participation/list`);
    return data;
  };

  /**
   * Get all Plans a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetPlanForViewResponse[]>}
   */
  const getUserPlansList = async (userId: number): Promise<IGetPlanForViewResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/plans/list`);
    return data;
  };

  /**
   * Delete Plan based on Plan ID
   *
   * @param {number} planId
   * @returns {*} {Promise<boolean>}
   */
  const deletePlan = async (planId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/plan/${planId}/delete`);

    return data;
  };

  /**
   * Get plans list (potentially based on filter criteria).
   *
   * @param {IPlansAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetPlansForViewResponse[]>}
   */
  const getPlansList = async (
    filterFieldData?: IPlanAdvancedFilterRequest
  ): Promise<IGetPlanForViewResponse[]> => {
    const { data } = await axios.get(`/api/plan/list`, {
      params: filterFieldData,
      paramsSerializer: (params) => {
        return qs.stringify(params, {
          arrayFormat: 'repeat',
          filter: (_prefix, value) => value || undefined
        });
      }
    });

    return data;
  };

  /**
   * Get Plan details based on its ID for viewing purposes.
   *
   * @param {number} planId
   * @return {*} {Promise<IGetPlanForViewResponse>}
   */
  const getPlanById = async (planId: number): Promise<IGetPlanForViewResponse> => {
    const { data } = await axios.get(`/api/plan/${planId}/view`);

    return data;
  };

  /**
   * Get Plan details based on its ID for editing purposes.
   *
   * @param {number} planId
   * @return {*}  {Promise<IGetPlanForEditResponse>}
   */
  const getPlanByIdForUpdate = async (planId: number): Promise<IGetPlanForEditResponse> => {
    const { data } = await axios.get(`/api/plan/${planId}/update`);

    return data;
  };

  /**
   * Update an existing Plan.
   *
   * @param {number} planId
   * @param {IEditPlanRequest} PlanData
   * @return {*}  {Promise<any>}
   */
  const updatePlan = async (
    planId: number,
    PlanData: IEditPlanRequest
  ): Promise<IEditPlanResponse> => {
    // if project image is provided, handle it
    if (PlanData.project.project_image) {
      // if image key is provided, remove the image from the project

      const projectImage = PlanData.project.project_image;
      PlanData.project.project_image = null;
      PlanData.project.image_url = undefined;
      PlanData.project.image_key = undefined;

      await uploadPlanAttachments(planId, projectImage, S3FileType.THUMBNAIL);
    } else if (!PlanData.project.project_image && PlanData.project.image_key) {
      PlanData.project.image_url = undefined;
      PlanData.project.image_key = undefined;

      await deletePlanThumbnail(planId);
    }

    const { data } = await axios.put(`api/plan/${planId}/update`, PlanData);

    return data;
  };

  /**
   * Create a new Plan.
   *
   * @param {ICreatePlanRequest} Plan
   * @return {*}  {Promise<ICreatePlanResponse>}
   */
  const createPlan = async (plan: ICreatePlanRequest): Promise<ICreatePlanResponse> => {
    // Handle the project image file
    // remove the image file off project json
    const projectImage = plan.project.project_image;
    plan.project.project_image = null;
    plan.project.image_url = undefined;

    const imageKey = plan.project.image_key;
    plan.project.image_key = undefined;

    const { data } = await axios.post('/api/plan/create', plan);

    const projectId = data.project_id;

    /*
     * Upload Thumbnail Image
     * If a project image is provided, upload it to S3 and associate it with the project.
     * If an image URL is provided, associate it with the project. and move the image to the correct location
     */
    if (projectImage) {
      await uploadPlanAttachments(projectId, projectImage, S3FileType.THUMBNAIL);
    } else if (imageKey) {
      await axios.post(`/api/project/${projectId}/attachments/update`, {
        key: imageKey,
        fileType: S3FileType.THUMBNAIL
      });
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
  const uploadPlanAttachments = async (
    projectId: number,
    file: File,
    fileType: string,
    cancelTokenSource?: CancelTokenSource
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);
    req_message.append('fileType', fileType);

    const { data } = await axios.post(`/api/project/${projectId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token
    });

    return data;
  };

  /**
   * Delete plan thumbnail based on project ID
   *
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   */
  const deletePlanThumbnail = async (projectId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/attachments/thumbnail/delete`);

    return data;
  };

  return {
    getAllUserPlansParticipation,
    getPlansList,
    createPlan,
    getPlanById,
    getPlanByIdForUpdate,
    updatePlan,
    deletePlan,
    getUserPlansList,
    uploadPlanAttachments,
    deletePlanThumbnail
  };
};

export default usePlanApi;
