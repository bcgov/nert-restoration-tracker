import { useContext } from 'react';
import { ConfigContext, IConfig } from 'contexts/configContext';

/**
 * Returns an instance of `IConfig` from `ConfigContext`.
 *
 * @return {*}  {IConfig}
 */
export const useConfigContext = (): IConfig => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw Error(
      'AuthStateContext is undefined, please verify you are calling useConfigContext() as child of an <AuthStateProvider> component.'
    );
  }

  return context;
};
