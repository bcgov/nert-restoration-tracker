export const communities = {
  type: 'FeatureCollection',
  name: 'communities',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [
    {
      type: 'Feature',
      properties: { fid: 1, name: 'Fort Nelson First Nation' },
      geometry: { type: 'Point', coordinates: [-122.656683, 58.750536] }
    },
    {
      type: 'Feature',
      properties: { fid: 2, name: 'Prophet River First Nation' },
      geometry: { type: 'Point', coordinates: [-122.694964, 58.092245] }
    },
    {
      type: 'Feature',
      properties: { fid: 3, name: 'Doig River First Nation' },
      geometry: { type: 'Point', coordinates: [-120.493307, 56.571907] }
    },
    {
      type: 'Feature',
      properties: { fid: 4, name: 'Blueberry River First Nations' },
      geometry: { type: 'Point', coordinates: [-121.109, 56.701521] }
    },
    {
      type: 'Feature',
      properties: { fid: 5, name: 'Halfway River First Nation' },
      geometry: { type: 'Point', coordinates: [-121.963462, 56.514929] }
    },
    {
      type: 'Feature',
      properties: { fid: 6, name: 'West Moberly First Nations' },
      geometry: { type: 'Point', coordinates: [-121.842861, 55.828038] }
    },
    {
      type: 'Feature',
      properties: { fid: 7, name: 'McLeod Lakes Indian Band' },
      geometry: { type: 'Point', coordinates: [-123.045943, 54.984511] }
    },
    {
      type: 'Feature',
      properties: { fid: 8, name: 'Saulteau First Nations' },
      geometry: { type: 'Point', coordinates: [-121.662535, 55.837334] }
    }
  ]
};
