import { Feature } from 'geojson';

/**
 * Get search results response object.
 *
 * @export
 * @interface IGetSearchResultsResponse
 */
export interface IGetSearchResultsResponse {
  id: string;
  name: string;
  state_code: number;
  number_sites: number;
  size_ha: number;
  is_project: boolean;
  geometry: Feature[];
}

/**
 * An interface for an instance of filter fields for search results
 */
export interface ISearchResultsAdvancedFilterRequest {
  record_type: string;
  geometry: Feature[];
}
