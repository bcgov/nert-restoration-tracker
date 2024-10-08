import { AxiosInstance } from 'axios';
import { CodeType, CombinedCode, IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useCodesApi = (axios: AxiosInstance) => {
  /**
   * Fetch all code sets.
   *
   * @return {*}  {Promise<IGetAllCodeSetsResponse>}
   */
  const getAllCodeSets = async (): Promise<IGetAllCodeSetsResponse> => {
    const { data } = await axios.get('/api/codes/');

    return data;
  };

  /**
   * Update a code.
   *
   * @param {CodeType} codeType
   * @param {CombinedCode} codeData
   * @return {*}  {Promise<number>}
   */
  const updateCode = async (codeType: CodeType, codeData: CombinedCode): Promise<number> => {
    const data = {
      codeType,
      codeData
    };
    const { status } = await axios.post(`/api/codes/`, data);

    return status;
  };

  return {
    getAllCodeSets,
    updateCode
  };
};

export default useCodesApi;
