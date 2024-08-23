import { AxiosInstance, CancelTokenSource } from 'axios';
import { S3FileType } from 'constants/attachments';
import { IGetPlanForViewResponse } from 'interfaces/usePlanApi.interface';
import {
  IAddProjectParticipant,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IEditProjectRequest,
  IGetProjectAttachmentsResponse,
  IGetProjectForEditResponse,
  IGetProjectForViewResponse,
  IGetProjectParticipantsResponse,
  IGetUserProjectsListResponse,
  IProjectAdvancedFilterRequest,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useProjectApi = (axios: AxiosInstance) => {
  /**
   * Get all role and project ids for all projects a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getAllUserProjectsParticipation = async (
    userId: number
  ): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/participation/list`);
    return data;
  };

  /**
   * Get all projects a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectForViewResponse[]>}
   */
  const getUserProjectsList = async (userId: number): Promise<IGetProjectForViewResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/list`);
    return data;
  };

  /**
   * Get project attachments based on project ID.
   *
   * @param {number} projectId
   * @param {S3Folder} [type]
   * @return {*}  {Promise<IGetProjectAttachmentsResponse>}
   */
  const getProjectAttachments = async (
    projectId: number,
    type?: S3FileType
  ): Promise<IGetProjectAttachmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/list`, {
      params: { type: type },
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
   * Delete project based on project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<boolean>}
   */
  const deleteProject = async (projectId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/project/${projectId}/delete`);

    return data;
  };

  /**
   * Delete project attachment based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @returns {*} {Promise<number>}
   */
  const deleteProjectAttachment = async (
    projectId: number,
    attachmentId: number
  ): Promise<number> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/attachments/${attachmentId}/delete`
    );

    return data;
  };

  /**
   * Delete project thumbnail based on project ID
   *
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   */
  const deleteProjectThumbnail = async (projectId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/attachments/thumbnail/delete`);

    return data;
  };

  /**
   * Get projects list (potentially based on filter criteria).
   *
   * @param {IProjectAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetProjectForViewResponse[]>}
   */
  const getProjectsList = async (
    filterFieldData?: IProjectAdvancedFilterRequest
  ): Promise<IGetProjectForViewResponse[]> => {
    const { data } = await axios.get(`/api/project/list`, {
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
   * Get project details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {Promise<IGetProjectForViewResponse>}
   */
  const getProjectById = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/view`);

    return data;
  };

  /**
   * Get project details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {Promise<IGetProjectForViewResponse>}
   */
  const getProjectByIdForEdit = async (projectId: number): Promise<IGetProjectForEditResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/update`);

    return data;
  };

  /**
   * Update an existing project.
   *
   * @param {number} projectId
   * @param {IEditProjectRequest} projectData
   * @return {*}  {Promise<any>}
   */
  const updateProject = async (
    projectId: number,
    projectData: IEditProjectRequest
  ): Promise<{ id: number }> => {
    // if project image is provided, handle it
    if (projectData.project.project_image) {
      // if image key is provided, remove the image from the project

      const projectImage = projectData.project.project_image;
      projectData.project.project_image = null;

      await uploadProjectAttachments(projectId, projectImage, S3FileType.THUMBNAIL);
    } else if (!projectData.project.image_key) {
      await deleteProjectThumbnail(projectId);
    }

    const { data } = await axios.put(`api/project/${projectId}/update`, projectData);

    return data;
  };

  /**
   * Create a new project.
   *
   * @param {ICreateProjectRequest} project
   * @return {*}  {Promise<ICreateProjectResponse>}
   */
  const createProject = async (project: ICreateProjectRequest): Promise<ICreateProjectResponse> => {
    // Handle the project image file
    // remove the image file off project json
    const projectImage = project.project.project_image;
    project.project.project_image = null;
    project.project.image_url = undefined;

    const imageKey = project.project.image_key;
    project.project.image_key = undefined;

    const { data } = await axios.post('/api/project/create', project);

    const projectId = data.id;

    /*
     * Upload Thumbnail Image
     * If a project image is provided, upload it to S3 and associate it with the project.
     * If an image URL is provided, associate it with the project. and move the image to the correct location
     */
    if (projectImage) {
      await uploadProjectAttachments(projectId, projectImage, S3FileType.THUMBNAIL);
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
  const uploadProjectAttachments = async (
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
   * Get all project participants.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetProjectParticipantsResponse>}
   */
  const getProjectParticipants = async (
    projectId: number
  ): Promise<IGetProjectParticipantsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/participants/get`);

    return data;
  };

  /**
   * Add new project participants.
   *
   * @param {number} projectId
   * @param {IAddProjectParticipant[]} participants
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const addProjectParticipants = async (
    projectId: number,
    participants: IAddProjectParticipant[]
  ): Promise<boolean> => {
    const { status } = await axios.post(`/api/project/${projectId}/participants/create`, {
      participants
    });

    return status === 200;
  };

  /**
   * Remove existing project participant.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const removeProjectParticipant = async (
    projectId: number,
    projectParticipationId: number
  ): Promise<boolean> => {
    const { status } = await axios.delete(
      `/api/project/${projectId}/participants/${projectParticipationId}/delete`
    );

    return status === 200;
  };

  /**
   * Update project participant role.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @param {string} role
   * @return {*}  {Promise<boolean>}
   */
  const updateProjectParticipantRole = async (
    projectId: number,
    projectParticipationId: number,
    roleId: number
  ): Promise<boolean> => {
    const { status } = await axios.put(
      `/api/project/${projectId}/participants/${projectParticipationId}/update`,
      {
        roleId
      }
    );

    return status === 200;
  };

  /**
   * Update project state code based on project ID
   *
   * @param {number} projectId
   * @param {number} statCode
   * @return {*}  {Promise<number>}
   */
  const updateProjectStateCode = async (projectId: number, stateCode: number): Promise<number> => {
    const { data } = await axios.put(`/api/project/${projectId}/state/${stateCode}/update`);

    return data;
  };

  return {
    getAllUserProjectsParticipation,
    getProjectsList,
    createProject,
    getProjectById,
    getProjectByIdForEdit,
    uploadProjectAttachments,
    updateProject,
    getProjectAttachments,
    deleteProjectAttachment,
    deleteProjectThumbnail,
    deleteProject,
    getProjectParticipants,
    addProjectParticipants,
    removeProjectParticipant,
    updateProjectParticipantRole,
    getUserProjectsList,
    updateProjectStateCode
  };
};

export default useProjectApi;

/**
 * Returns a set of supported api methods for working with public (published) project records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const usePublicProjectApi = (axios: AxiosInstance) => {
  /**
   * Get projects list (potentially based on filter criteria).
   *
   * @param {IProjectAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetProjectForViewResponse[]>}
   */
  const getProjectsList = async (
    filterFieldData?: IProjectAdvancedFilterRequest
  ): Promise<IGetProjectForViewResponse[]> => {
    const { data } = await axios.get(`/api/public/projects`, {
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
   * Get plans list (potentially based on filter criteria).
   *
   * @param {IProjectAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetProjectForViewResponse[]>}
   */
  const getPlansList = async (
    filterFieldData?: IProjectAdvancedFilterRequest
  ): Promise<IGetPlanForViewResponse[]> => {
    const { data } = await axios.get(`/api/public/plans`, {
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
   * Get public (published) project or plan details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {any>}  could be a project or a plan response
   */
  const getProjectPlanForView = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/view`);

    return data;
  };

  /**
   * Get public (published) project attachments based on project ID
   *
   * @param {number} projectId
   * @param {S3FileType} type
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const getProjectAttachments = async (
    projectId: number,
    type?: S3FileType
  ): Promise<IGetProjectAttachmentsResponse> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/attachments/list`, {
      params: { type: type }
    });
    return data;
  };

  return {
    getPlansList,
    getProjectsList,
    getProjectPlanForView,
    getProjectAttachments
  };
};
