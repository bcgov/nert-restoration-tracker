import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface IRedirectProps {
  basePath: string;
}
export const RedirectURL: React.FC<IRedirectProps> = (props) => {
  const { basePath } = props;
  const { id } = useParams();
  return <Navigate replace to={`${basePath}/${id}/details`} />;
};
