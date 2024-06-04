import codes from './codes';
import eml from './eml';
import permit from './permit';
import project from './project';
import projectParticipation from './project-participation';
import publicQueries from './public';
import search from './search';
import spatial from './spatial';

export const queries = {
  codes,
  eml,
  permit,
  project,
  projectParticipation,
  public: publicQueries,
  search,
  spatial
};
