import { AxiosInstance } from 'axios';
import {
  ICreatePlanRequest,
  ICreatePlanResponse,
  IEditPlanRequest,
  IEditPlanResponse,
  IGetPlanForViewResponse,
  IGetUserPlansListResponse,
  IPlanAdvancedFilterRequest
} from 'interfaces/usePlanApi.interface';
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
    const { data } = await axios.get(`/api/user/${userId}/plan/list`);
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
    const { data } = await axios.put(`api/plan/${planId}/update`, PlanData);

    return data;
  };

  /**
   * Create a new Plan.
   *
   * @param {ICreatePlanRequest} Plan
   * @return {*}  {Promise<ICreatePlanResponse>}
   */
  const createPlan = async (Plan: ICreatePlanRequest): Promise<ICreatePlanResponse> => {
    const { data } = await axios.post('/api/plan/create', Plan);

    return data;
  };

  return {
    getAllUserPlansParticipation,
    getPlansList,
    createPlan,
    getPlanById,
    updatePlan,
    deletePlan,
    getUserPlansList
  };
};

export default usePlanApi;

/**
 * Returns a set of supported api methods for working with public (published) Plan records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const usePublicPlanApi = (axios: AxiosInstance) => {
  /**
   * Get public (published) Plan or plan details based on its ID for viewing purposes.
   *
   * @param {number} planId
   * @return {*} {any>}  could be a Plan or a plan response
   */
  const getPlanPlanForView = async (planId: number): Promise<any> => {
    const { data } = await axios.get(`/api/public/plan/${planId}/view`);

    return data;
  };

  return {
    getPlanPlanForView
  };
};
