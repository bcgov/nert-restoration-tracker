import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { DialogContext, IDialogContext } from 'contexts/dialogContext';
import { ITaxonomyContext, TaxonomyContext } from 'contexts/taxonomyContext';
import { useContext } from 'react';

/**
 * Returns an instance of `IConfig` from `ConfigContext`.
 *
 * @return {*}  {IConfig}
 */
export const useConfigContext = (): IConfig => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw Error(
      'ConfigContext is undefined, please verify you are calling useConfigContext() as child of an <ConfigContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ICodesContext` from `CodesContext`.
 *
 * @return {*}  {ICodesContext}
 */
export const useCodesContext = (): ICodesContext => {
  const context = useContext(CodesContext);

  if (!context) {
    throw Error(
      'CodesContext is undefined, please verify you are calling useCodesContext() as child of an <CodesContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `IDialogContext` from `DialogContext`.
 *
 * @return {*}  {IDialogContext}
 */
export const useDialogContext = (): IDialogContext => {
  const context = useContext(DialogContext);

  if (!context) {
    throw Error(
      'DialogContext is undefined, please verify you are calling useDialogContext() as child of an <DialogContextProvider> component.'
    );
  }

  return context;
};

/**
 * Returns an instance of `ITaxonomyContext` from `SurveyContext`.
 *
 * @return {*}  {ITaxonomyContext}
 */
export const useTaxonomyContext = (): ITaxonomyContext => {
  const context = useContext(TaxonomyContext);

  if (!context) {
    throw Error(
      'TaxonomyContext is undefined, please verify you are calling useTaxonomyContext() as child of an <TaxonomyContextProvider> component.'
    );
  }

  return context;
};
