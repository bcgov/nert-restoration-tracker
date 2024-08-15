import * as turf from '@turf/turf';
import { BlobWriter, ZipWriter, TextReader } from '@zip.js/zip.js';
import dayjs from 'dayjs';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import * as utils from 'utils/pagedProjectPlanTableUtils';
/**
 * Export all the project data.
 * This will eventually reside in a different place so all forms can use it.
 */
interface ExtendedFeatureCollection extends FeatureCollection<Geometry, GeoJsonProperties> {
  metadata?: object;
}

const packageData = (project: any | null): ExtendedFeatureCollection => {
  // Because turf doesn't know about the metadata property.
  const fc: ExtendedFeatureCollection = turf.featureCollection(project?.location.geometry || []);

  // Add the bounding box to the feature collection.
  const bbox = turf.bbox(fc);
  fc.bbox = bbox;

  // Add the metadata to the feature collection, excluding the location property.
  fc.metadata = {
    ...Object.fromEntries(Object.entries(project).filter(([key]) => key !== 'location'))
  };
  return fc;
};

/**
 * Download the project data as a GeoJSON file.
 */
export const exportData = async (projects: any[] | null) => {
  if (!projects) return;

  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);

  for (const project of projects) {
    // Create the GeoJSON file.
    const fc = packageData(project);
    const fcTxt = new TextReader(JSON.stringify(fc));

    // Create the file name.
    const projectName = project.project.project_name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${projectName}.geojson`;

    await zipWriter.add(fileName, fcTxt);
  }

  zipWriter.close();

  const blob = await zipFileWriter.getData();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const day = dayjs().format('DD-MM-YYYY');
  const zipfileName = `restoration_tracker_data_${day}.zip`;
  a.download = zipfileName;
  document.body.appendChild(a);
  a.click();

  // Clean up.
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const isProjectData = (data: utils.ProjectData | utils.PlanData): data is utils.ProjectData => {
  return (data as utils.ProjectData).projectId !== undefined;
};

// The interface for the calculateSelectedProjectsPlans function.
interface CalculateSelectedProjectsPlans {
  (
    selected: readonly number[],
    rows: utils.ProjectData[] | utils.PlanData[],
    allProjects: any
  ): any;
}

/**
 * Calculate the selected projects array.
 * @param selected rows
 * @param rows filtered by the page
 * @param allProjects
 * @returns selected projects
 */
export const calculateSelectedProjectsPlans: CalculateSelectedProjectsPlans = (
  selected: readonly number[],
  rows: utils.ProjectData[] | utils.PlanData[],
  allProjects: any
) => {
  const projectIds = selected.map((id) => {
    return isProjectData(rows[id]) ? rows[id].projectId : rows[id].planId;
  });
  return allProjects.filter((proj: { project: { project_id: number } }) =>
    projectIds.includes(proj.project.project_id)
  );
};
