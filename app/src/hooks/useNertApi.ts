import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAdminApi from './api/useAdminApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useExternalApi from './api/useExternalApi';
import usePlanApi from './api/usePlanApi';
import useProjectApi, { usePublicProjectApi } from './api/useProjectApi';
import useSearchApi, { usePublicSearchApi } from './api/useSearchApi';
import useTaxonomyApi from './api/useTaxonomyApi';
import useUserApi from './api/useUserApi';
import useProjectParticipationApi from './api/useProjectParticipationApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useNertApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);

  const project = useProjectApi(apiAxios);

  const plan = usePlanApi(apiAxios);

  const search = useSearchApi(apiAxios);

  const taxonomy = useTaxonomyApi();

  const codes = useCodesApi(apiAxios);

  const draft = useDraftApi(apiAxios);

  const user = useUserApi(apiAxios);

  const admin = useAdminApi(apiAxios);

  const external = useExternalApi(axios);

  const projectParticipation = useProjectParticipationApi(apiAxios);

  const publicApis = {
    project: usePublicProjectApi(apiAxios),
    search: usePublicSearchApi(apiAxios)
  };

  return {
    project,
    plan,
    search,
    taxonomy,
    codes,
    draft,
    user,
    admin,
    external,
    projectParticipation,
    public: publicApis
  };
};
