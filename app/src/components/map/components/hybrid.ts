export const hybridJSON = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256
    },
    openmaptiles: {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${process.env.REACT_APP_MAPTILER_API_KEY}`
    }
  },
  layers: [
    {
      id: 'simple-tiles',
      type: 'raster',
      source: 'raster-tiles',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'Aeroway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      minzoom: 11,
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,100%)',
        'line-width': [
          'interpolate',
          ['linear', 1],
          ['zoom'],
          11,
          ['match', ['get', 'class'], ['runway'], 3, 0.5],
          20,
          ['match', ['get', 'class'], ['runway'], 16, 6]
        ]
      },
      metadata: {}
    },
    {
      id: 'Heliport',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'aeroway',
      minzoom: 11,
      layout: { visibility: 'visible' },
      paint: { 'fill-color': 'hsl(0,0%,100%)', 'fill-opacity': 1 },
      metadata: {},
      filter: ['in', 'class', 'helipad', 'heliport']
    },
    {
      id: 'Ferry line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { 'line-join': 'round', visibility: 'visible' },
      paint: {
        'line-color': {
          stops: [
            [10, 'hsl(205,61%,63%)'],
            [16, 'hsl(205,67%,47%)']
          ]
        },
        'line-width': 1.1,
        'line-dasharray': [2, 2]
      },
      filter: ['==', 'class', 'ferry']
    },
    {
      id: 'Tunnel outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'class'],
          'motorway',
          'hsl(28,72%,69%)',
          ['trunk', 'primary'],
          'hsl(28,72%,69%)',
          'hsl(36,5%,80%)'
        ],
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          6,
          0,
          7,
          0.5,
          10,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 0, 2.5],
            ['trunk', 'primary'],
            2,
            0
          ],
          12,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 2, 6],
            ['trunk', 'primary'],
            3,
            ['secondary', 'tertiary'],
            2,
            ['minor', 'service', 'track'],
            1,
            0.5
          ],
          14,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 5, 8],
            ['trunk'],
            4,
            ['primary'],
            6,
            ['secondary'],
            6,
            ['tertiary'],
            4,
            ['minor', 'service', 'track'],
            3,
            3
          ],
          16,
          [
            'match',
            ['get', 'class'],
            ['motorway', 'trunk', 'primary'],
            10,
            ['secondary'],
            8,
            ['tertiary'],
            8,
            ['minor', 'service', 'track'],
            4,
            4
          ],
          20,
          [
            'match',
            ['get', 'class'],
            ['motorway', 'trunk', 'primary'],
            26,
            ['secondary'],
            26,
            ['tertiary'],
            26,
            ['minor', 'service', 'track'],
            18,
            18
          ]
        ],
        'line-dasharray': [0.5, 0.25]
      },
      metadata: {},
      filter: [
        'all',
        ['==', 'brunnel', 'tunnel'],
        [
          '!in',
          'class',
          'bridge',
          'ferry',
          'rail',
          'transit',
          'pier',
          'path',
          'aerialway',
          'motorway_construction',
          'trunk_construction',
          'primary_construction',
          'secondary_construction',
          'tertiary_construction',
          'minor_construction',
          'service_construction',
          'track_construction'
        ]
      ]
    },
    {
      id: 'Tunnel',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'class'],
          'motorway',
          'hsl(35,100%,76%)',
          ['trunk', 'primary'],
          'hsl(48,100%,88%)',
          'hsl(0,0%,96%)'
        ],
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          5,
          0,
          6,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'brunnel'], ['bridge'], 0, 1],
            ['trunk', 'primary'],
            0,
            0
          ],
          10,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 0, 2.5],
            ['trunk', 'primary'],
            1.5,
            1
          ],
          12,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 1, 4],
            ['trunk'],
            2.5,
            ['primary'],
            2.5,
            ['secondary', 'tertiary'],
            1.5,
            ['minor', 'service', 'track'],
            1,
            1
          ],
          14,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'ramp'], 1, 5, 6],
            ['trunk'],
            3,
            ['primary'],
            5,
            ['secondary'],
            4,
            ['tertiary'],
            3,
            ['minor', 'service', 'track'],
            2,
            2
          ],
          16,
          [
            'match',
            ['get', 'class'],
            ['motorway', 'trunk', 'primary'],
            8,
            ['secondary'],
            7,
            ['tertiary'],
            6,
            ['minor', 'service', 'track'],
            4,
            4
          ],
          20,
          [
            'match',
            ['get', 'class'],
            ['motorway', 'trunk', 'primary'],
            24,
            ['secondary'],
            24,
            ['tertiary'],
            24,
            ['minor', 'service', 'track'],
            16,
            16
          ]
        ],
        'line-opacity': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', 'brunnel', 'tunnel'],
        [
          '!in',
          'class',
          'ferry',
          'rail',
          'transit',
          'pier',
          'bridge',
          'path',
          'aerialway',
          'motorway_construction',
          'trunk_construction',
          'primary_construction',
          'secondary_construction',
          'tertiary_construction',
          'minor_construction',
          'service_construction',
          'track_construction'
        ]
      ]
    },
    {
      id: 'Railway tunnel',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,73%)',
        'line-width': {
          base: 1.4,
          stops: [
            [14, 0.4],
            [15, 0.75],
            [20, 2]
          ]
        },
        'line-opacity': 0.5
      },
      metadata: {},
      filter: ['all', ['==', 'brunnel', 'tunnel'], ['==', 'class', 'rail']]
    },
    {
      id: 'Railway tunnel hatching',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,73%)',
        'line-width': {
          base: 1.4,
          stops: [
            [14.5, 0],
            [15, 3],
            [20, 8]
          ]
        },
        'line-opacity': 0.5,
        'line-dasharray': [0.2, 8]
      },
      metadata: {},
      filter: ['all', ['==', 'brunnel', 'tunnel'], ['==', 'class', 'rail']]
    },
    {
      id: 'Footway tunnel outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      layout: {
        'line-cap': 'round',
        'line-join': 'miter',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,100%)',
        'line-width': {
          base: 1.2,
          stops: [
            [14, 0],
            [16, 0],
            [18, 4],
            [22, 8]
          ]
        },
        'line-opacity': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'LineString'],
        ['in', 'class', 'path', 'pedestrian'],
        ['==', 'brunnel', 'tunnel']
      ]
    },
    {
      id: 'Footway tunnel',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,63%)',
        'line-width': {
          base: 1.2,
          stops: [
            [14, 0.5],
            [16, 1],
            [18, 2],
            [22, 5]
          ]
        },
        'line-opacity': 0.4,
        'line-dasharray': {
          stops: [
            [14, [1, 0.5]],
            [18, [1, 0.25]]
          ]
        }
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'LineString'],
        ['in', 'class', 'path', 'pedestrian'],
        ['==', 'brunnel', 'tunnel']
      ]
    },
    {
      id: 'Pier',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: { 'fill-color': 'hsl(42,49%,93%)', 'fill-antialias': true },
      metadata: {},
      filter: ['all', ['==', '$type', 'Polygon'], ['==', 'class', 'pier']]
    },
    {
      id: 'Pier road',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(42,49%,93%)',
        'line-width': {
          base: 1.2,
          stops: [
            [15, 1],
            [17, 4]
          ]
        }
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'pier']]
    },
    {
      id: 'Bridge',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'fill-color': 'hsl(42,49%,93%)',
        'fill-opacity': 0.6,
        'fill-antialias': true
      },
      metadata: {},
      filter: ['==', 'brunnel', 'bridge']
    },
    {
      id: 'Minor road outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(36,5%,80%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          6,
          0,
          7,
          0.5,
          12,
          [
            'match',
            ['get', 'class'],
            ['secondary', 'tertiary'],
            2,
            ['minor', 'service', 'track'],
            1,
            0.5
          ],
          14,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            6,
            ['tertiary'],
            4,
            ['minor', 'service', 'track'],
            3,
            3
          ],
          16,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            8,
            ['tertiary'],
            8,
            ['minor', 'service', 'track'],
            4,
            4
          ],
          20,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            26,
            ['tertiary'],
            26,
            ['minor', 'service', 'track'],
            18,
            18
          ]
        ],
        'line-opacity': 1
      },
      metadata: {},
      filter: [
        'all',
        ['!=', 'brunnel', 'tunnel'],
        [
          '!in',
          'class',
          'aerialway',
          'bridge',
          'ferry',
          'minor_construction',
          'motorway',
          'motorway_construction',
          'path',
          'path_construction',
          'pier',
          'primary',
          'primary_construction',
          'rail',
          'secondary_construction',
          'service_construction',
          'tertiary_construction',
          'track_construction',
          'transit',
          'trunk_construction'
        ]
      ]
    },
    {
      id: 'Major road outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(28,72%,69%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          6,
          0,
          7,
          0.5,
          10,
          ['match', ['get', 'class'], ['trunk', 'primary'], 2.4, 0],
          12,
          ['match', ['get', 'class'], ['trunk', 'primary'], 3, 0.5],
          14,
          ['match', ['get', 'class'], ['trunk'], 4, ['primary'], 6, 3],
          16,
          ['match', ['get', 'class'], ['trunk', 'primary'], 10, 4],
          20,
          ['match', ['get', 'class'], ['trunk', 'primary'], 26, 18]
        ],
        'line-opacity': 1
      },
      metadata: {},
      filter: ['all', ['!=', 'brunnel', 'tunnel'], ['in', 'class', 'primary', 'trunk']]
    },
    {
      id: 'Highway outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(28,72%,69%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          6,
          0,
          7,
          0.5,
          10,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 0, 2.5], 0],
          12,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 2, 6], 0.5],
          14,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 5, 8], 3],
          16,
          ['match', ['get', 'class'], ['motorway'], 10, 4],
          20,
          ['match', ['get', 'class'], ['motorway'], 26, 18]
        ],
        'line-opacity': 1
      },
      metadata: {},
      filter: ['all', ['!=', 'brunnel', 'tunnel'], ['==', 'class', 'motorway']]
    },
    {
      id: 'Road under construction',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'square',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'class'],
          'motorway_construction',
          'hsl(35,100%,76%)',
          ['trunk_construction', 'primary_construction'],
          'hsl(48,100%,83%)',
          'hsl(0,0%,100%)'
        ],
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          5,
          0,
          6,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction'],
            ['match', ['get', 'brunnel'], ['bridge'], 0, 1],
            ['trunk_construction', 'primary_construction'],
            0,
            0
          ],
          10,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction'],
            ['match', ['get', 'ramp'], 1, 0, 2.5],
            ['trunk_construction', 'primary_construction'],
            1.5,
            1
          ],
          12,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction'],
            ['match', ['get', 'ramp'], 1, 1, 4],
            ['trunk_construction'],
            2.5,
            ['primary_construction'],
            2.5,
            ['secondary_construction', 'tertiary_construction'],
            1.5,
            ['minor_construction', 'service_construction', 'track_construction'],
            1,
            1
          ],
          14,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction'],
            ['match', ['get', 'ramp'], 1, 5, 6],
            ['trunk_construction'],
            3,
            ['primary_construction'],
            5,
            ['secondary_construction'],
            4,
            ['tertiary_construction'],
            3,
            ['minor_construction', 'service_construction', 'track_construction'],
            2,
            2
          ],
          16,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction', 'trunk_construction', 'primary_construction'],
            8,
            ['secondary_construction'],
            7,
            ['tertiary_construction'],
            6,
            ['minor_construction', 'service_construction', 'track_construction'],
            4,
            4
          ],
          20,
          [
            'match',
            ['get', 'class'],
            ['motorway_construction', 'trunk_construction', 'primary_construction'],
            24,
            ['secondary_construction'],
            24,
            ['tertiary_construction'],
            24,
            ['minor_construction', 'service_construction', 'track_construction'],
            16,
            16
          ]
        ],
        'line-opacity': ['case', ['==', ['get', 'brunnel'], 'tunnel'], 0.7, 1],
        'line-dasharray': [2, 2]
      },
      metadata: {},
      filter: [
        'in',
        'class',
        'motorway_construction',
        'trunk_construction',
        'primary_construction',
        'secondary_construction',
        'tertiary_construction',
        'minor_construction',
        'service_construction',
        'track_construction'
      ]
    },
    {
      id: 'Minor road',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,100%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          5,
          0.5,
          10,
          1,
          12,
          [
            'match',
            ['get', 'class'],
            ['secondary', 'tertiary'],
            1.5,
            ['minor', 'service', 'track'],
            1,
            1
          ],
          14,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            4,
            ['tertiary'],
            3,
            ['minor', 'service', 'track'],
            2,
            2
          ],
          16,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            7,
            ['tertiary'],
            6,
            ['minor', 'service', 'track'],
            4,
            4
          ],
          20,
          [
            'match',
            ['get', 'class'],
            ['secondary'],
            24,
            ['tertiary'],
            24,
            ['minor', 'service', 'track'],
            16,
            16
          ]
        ]
      },
      metadata: {},
      filter: [
        'all',
        ['!=', 'brunnel', 'tunnel'],
        [
          '!in',
          'class',
          'aerialway',
          'bridge',
          'ferry',
          'minor_construction',
          'motorway',
          'motorway_construction',
          'path',
          'path_construction',
          'pier',
          'primary',
          'primary_construction',
          'rail',
          'secondary_construction',
          'service_construction',
          'tertiary_construction',
          'track_construction',
          'transit',
          'trunk_construction'
        ]
      ]
    },
    {
      id: 'Major road',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(48,100%,83%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          10,
          ['match', ['get', 'class'], ['trunk', 'primary'], 1.5, 1],
          12,
          ['match', ['get', 'class'], ['trunk', 'primary'], 2.5, 1],
          14,
          ['match', ['get', 'class'], ['trunk'], 3, ['primary'], 5, 2],
          16,
          ['match', ['get', 'class'], ['trunk', 'primary'], 8, 4],
          20,
          ['match', ['get', 'class'], ['trunk', 'primary'], 24, 16]
        ]
      },
      metadata: {},
      filter: ['all', ['!=', 'brunnel', 'tunnel'], ['in', 'class', 'primary', 'trunk']]
    },
    {
      id: 'Highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 4,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(35,100%,76%)',
        'line-width': [
          'interpolate',
          ['linear', 2],
          ['zoom'],
          5,
          0.5,
          6,
          [
            'match',
            ['get', 'class'],
            ['motorway'],
            ['match', ['get', 'brunnel'], ['bridge'], 0, 1],
            0
          ],
          10,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 0, 2.5], 1],
          12,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 1, 4], 1],
          14,
          ['match', ['get', 'class'], ['motorway'], ['match', ['get', 'ramp'], 1, 5, 6], 2],
          16,
          ['match', ['get', 'class'], ['motorway'], 8, 4],
          20,
          ['match', ['get', 'class'], ['motorway'], 24, 16]
        ]
      },
      metadata: {},
      filter: ['all', ['!=', 'brunnel', 'tunnel'], ['==', 'class', 'motorway']]
    },
    {
      id: 'Path outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      layout: {
        'line-cap': 'round',
        'line-join': 'miter',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,100%)',
        'line-width': {
          base: 1.2,
          stops: [
            [14, 0],
            [16, 0],
            [18, 4],
            [22, 8]
          ]
        }
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'LineString'],
        ['in', 'class', 'path', 'pedestrian'],
        ['!=', 'brunnel', 'tunnel']
      ]
    },
    {
      id: 'Path',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 12,
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0, 0%, 79%)',
        'line-width': {
          base: 1.2,
          stops: [
            [14, 0.5],
            [16, 1],
            [18, 2],
            [22, 5]
          ]
        },
        'line-dasharray': {
          stops: [
            [14, [1, 0.5]],
            [18, [1, 0.25]]
          ]
        }
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'LineString'],
        ['in', 'class', 'path', 'pedestrian'],
        ['!=', 'brunnel', 'tunnel']
      ]
    },
    {
      id: 'Major rail',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': {
          stops: [
            [8, 'hsl(0,0%,72%)'],
            [16, 'hsl(0,0%,70%)']
          ]
        },
        'line-width': {
          base: 1.4,
          stops: [
            [14, 0.4],
            [15, 0.75],
            [20, 2]
          ]
        },
        'line-opacity': ['match', ['get', 'service'], 'yard', 0.5, 1]
      },
      metadata: {},
      filter: ['all', ['!in', 'brunnel', 'tunnel'], ['==', 'class', 'rail']]
    },
    {
      id: 'Major rail hatching',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,72%)',
        'line-width': {
          base: 1.4,
          stops: [
            [14.5, 0],
            [15, 3],
            [20, 8]
          ]
        },
        'line-opacity': ['match', ['get', 'service'], 'yard', 0.5, 1],
        'line-dasharray': [0.2, 9]
      },
      metadata: {},
      filter: ['all', ['!in', 'brunnel', 'tunnel'], ['==', 'class', 'rail']]
    },
    {
      id: 'Minor rail',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,73%)',
        'line-width': {
          base: 1.4,
          stops: [
            [14, 0.4],
            [15, 0.75],
            [20, 2]
          ]
        }
      },
      metadata: {},
      filter: ['in', 'subclass', 'light_rail', 'tram']
    },
    {
      id: 'Minor rail hatching',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0,0%,73%)',
        'line-width': {
          base: 1.4,
          stops: [
            [14.5, 0],
            [15, 2],
            [20, 6]
          ]
        },
        'line-dasharray': [0.2, 4]
      },
      metadata: {},
      filter: ['in', 'subclass', 'tram', 'light_rail']
    },
    {
      id: 'boundary_3',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 3,
      layout: { 'line-join': 'round', visibility: 'visible' },
      paint: {
        'line-color': '#9e9cab',
        'line-width': {
          base: 1,
          stops: [
            [4, 0.4],
            [5, 0.7],
            [12, 1.6]
          ]
        },
        'line-dasharray': [5, 3]
      },
      metadata: {},
      filter: ['all', ['in', 'admin_level', 3, 4], ['==', 'maritime', 0]]
    },
    {
      id: 'boundary_2_z0-4',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 0,
      maxzoom: 5,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'rgba(139, 139, 139, 1)',
        'line-width': {
          base: 1,
          stops: [
            [3, 1],
            [5, 1.2]
          ]
        },
        'line-opacity': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', 'admin_level', 2],
        ['==', 'maritime', 0],
        ['==', 'disputed', 0],
        ['!has', 'claimed_by']
      ]
    },

    {
      id: 'boundary_2_z0-4_maritime',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 0,
      maxzoom: 5,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'rgba(98,185,229,1)',
        'line-width': {
          base: 1,
          stops: [
            [3, 1],
            [5, 1.2]
          ]
        },
        'line-opacity': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', 'admin_level', 2],
        ['!has', 'claimed_by'],
        ['==', 'disputed', 0],
        ['==', 'maritime', 1]
      ]
    },
    {
      id: 'boundary_2_z5_maritime',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 5,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'rgba(98,185,229,1)',
        'line-width': {
          base: 1,
          stops: [
            [5, 1.2],
            [12, 3]
          ]
        },
        'line-opacity': 1
      },
      metadata: {},
      filter: ['all', ['==', 'admin_level', 2], ['==', 'disputed', 0], ['==', 'maritime', 1]]
    },
    {
      id: 'water_name_line',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 0,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': 12,
        'text-field': ['concat', ['get', 'name:latin'], ' ', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-max-width': 5,
        'symbol-placement': 'line'
      },
      paint: {
        'text-color': '#5d60be',
        'text-halo-color': 'rgba(255,255,255,0.7)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'LineString']]
    },
    {
      id: 'water_name_point',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 2,
      maxzoom: 24,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': 12,
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-max-width': 5
      },
      paint: {
        'text-color': 'rgba(76, 125, 173, 1)',
        'text-halo-color': 'rgba(255,255,255,0)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'Point'], ['!=', 'class', 'ocean']]
    },
    {
      id: 'water_ocean_name_point',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 0,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': 12,
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-max-width': 5
      },
      paint: {
        'text-color': 'rgba(76, 125, 173, 1)',
        'text-halo-color': 'rgba(255,255,255,0)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'Point'], ['==', 'class', 'ocean']]
    },
    {
      id: 'poi_z16_subclass',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'poi',
      minzoom: 16,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': 12,
        'icon-image': '{subclass}_11',
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-anchor': 'top',
        'text-offset': [0, 0.6],
        'text-padding': 2,
        'text-max-width': 9
      },
      paint: {
        'text-color': '#666',
        'text-halo-blur': 0.5,
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['>=', 'rank', 20],
        [
          'any',
          [
            'all',
            ['in', 'class', 'pitch'],
            ['in', 'subclass', 'soccer', 'tennis', 'baseball', 'basketball', 'swimming', 'golf']
          ]
        ],
        ['any', ['!has', 'level'], ['==', 'level', 0]]
      ]
    },
    {
      id: 'poi_z16',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'poi',
      minzoom: 16,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': 12,
        'icon-image': '{class}_11',
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-anchor': 'top',
        'text-offset': [0, 0.6],
        'text-padding': 2,
        'text-max-width': 9
      },
      paint: {
        'text-color': '#666',
        'text-halo-blur': 0.5,
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['!=', 'class', 'swimming_pool'],
        ['>=', 'rank', 20],
        [
          'none',
          [
            'all',
            ['in', 'class', 'pitch'],
            ['in', 'subclass', 'soccer', 'tennis', 'baseball', 'basketball', 'swimming', 'golf']
          ]
        ],
        ['any', ['!has', 'level'], ['==', 'level', 0]]
      ]
    },
    {
      id: 'poi_z15',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'poi',
      minzoom: 15,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': 12,
        'icon-image': '{class}_11',
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-anchor': 'top',
        'text-offset': [0, 0.6],
        'text-padding': 2,
        'text-max-width': 9
      },
      paint: {
        'text-color': '#666',
        'text-halo-blur': 0.5,
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['!=', 'class', 'swimming_pool'],
        ['>=', 'rank', 7],
        ['<', 'rank', 20],
        ['any', ['!has', 'level'], ['==', 'level', 0]]
      ]
    },
    {
      id: 'poi_z14',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'poi',
      minzoom: 14.2,
      layout: {
        'icon-size': 0.9,
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': 12,
        'icon-image': '{class}_11',
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-anchor': 'top',
        'text-offset': [0, 0.6],
        'text-padding': 2,
        'text-max-width': 9
      },
      paint: {
        'text-color': '#666',
        'text-halo-blur': 0.5,
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      },
      metadata: {},
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['!=', 'class', 'swimming_pool'],
        ['any', ['<', 'rank', 7]],
        ['any', ['!has', 'level'], ['==', 'level', 0]]
      ]
    },
    {
      id: 'place_park',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'park',
      minzoom: 12,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          base: 1.2,
          stops: [
            [12, 10],
            [15, 14]
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'symbol-spacing': 1250,
        'text-max-width': 9,
        'text-transform': 'none',
        'symbol-avoid-edges': false,
        'text-letter-spacing': 0.1
      },
      paint: {
        'text-color': 'rgba(94, 141, 58, 1)',
        'text-halo-blur': 0.5,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      metadata: {},
      filter: ['all', ['==', 'rank', 1]]
    },
    {
      id: 'place_other',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 8,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          base: 1.2,
          stops: [
            [12, 10],
            [15, 14]
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-max-width': 9,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1
      },
      paint: {
        'text-color': 'rgba(66, 62, 62, 1)',
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      metadata: {},
      filter: ['all', ['in', 'class', 'hamlet', 'island', 'islet', 'neighbourhood', 'suburb']]
    },
    {
      id: 'place_village',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 8,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': {
          base: 1.2,
          stops: [
            [10, 12],
            [15, 22]
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        'text-max-width': 8
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'village']]
    },
    {
      id: 'place_town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 6,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': {
          base: 1.2,
          stops: [
            [7, 12],
            [11, 16]
          ]
        },
        'icon-image': {
          base: 1,
          stops: [
            [0, 'circle-stroked_16'],
            [10, '']
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        'text-anchor': 'bottom',
        'text-offset': [0, 0],
        'text-max-width': 8
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'town']]
    },
    {
      id: 'place_region',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 5,
      maxzoom: 7,
      layout: {
        'text-font': ['Roboto Medium', 'Noto Sans Regular'],
        'text-size': {
          stops: [
            [3, 9],
            [5, 10],
            [6, 11]
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-padding': 2,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1
      },
      paint: {
        'text-color': 'rgba(118, 116, 108, 1)',
        'text-halo-color': 'rgba(255,255,255,0.7)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'state'], ['in', 'rank', 3, 4, 5]]
    },
    {
      id: 'place_state',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 3,
      maxzoom: 6,
      layout: {
        'text-font': ['Roboto Medium', 'Noto Sans Regular'],
        'text-size': {
          stops: [
            [3, 9],
            [5, 11],
            [6, 12]
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        visibility: 'visible',
        'text-padding': 2,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1
      },
      paint: {
        'text-color': 'rgba(118, 116, 108, 1)',
        'text-halo-color': 'rgba(255,255,255,0.7)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'state'], ['in', 'rank', 1, 2]]
    },
    {
      id: 'place_city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 5,
      layout: {
        'text-font': ['Roboto Medium', 'Noto Sans Regular'],
        'text-size': {
          base: 1.2,
          stops: [
            [7, 14],
            [11, 24]
          ]
        },
        'icon-image': {
          base: 1,
          stops: [
            [0, 'circle-stroked_16'],
            [10, '']
          ]
        },
        'text-field': ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
        'text-anchor': 'bottom',
        'text-offset': [0, 0],
        'icon-optional': false,
        'text-max-width': 8,
        'icon-allow-overlap': true
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 1.2
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'city']]
    },
    {
      id: 'country_other',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [3, 9],
            [7, 15]
          ]
        },
        'text-field': '{name:latin}',
        'text-max-width': 6.25,
        'text-transform': 'none'
      },
      paint: {
        'text-color': '#334',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'country'], ['!has', 'iso_a2']]
    },
    {
      id: 'country_3',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [3, 11],
            [7, 17]
          ]
        },
        'text-field': '{name:latin}',
        'text-max-width': 6.25,
        'text-transform': 'none'
      },
      paint: {
        'text-color': '#334',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['>=', 'rank', 3], ['==', 'class', 'country'], ['has', 'iso_a2']]
    },
    {
      id: 'country_2',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [2, 11],
            [5, 17]
          ]
        },
        'text-field': '{name:latin}',
        'text-max-width': 6.25,
        'text-transform': 'none'
      },
      paint: {
        'text-color': '#334',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['==', 'rank', 2], ['==', 'class', 'country'], ['has', 'iso_a2']]
    },
    {
      id: 'country_1',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [1, 11],
            [4, 17],
            [6, 19]
          ]
        },
        'text-field': '{name:latin}',
        'text-max-width': 6.25,
        'text-transform': 'none'
      },
      paint: {
        'text-color': '#334',
        'text-halo-blur': 1,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': 0.8
      },
      metadata: {},
      filter: ['all', ['==', 'rank', 1], ['==', 'class', 'country'], ['has', 'iso_a2']]
    },
    {
      id: 'continent',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      maxzoom: 1,
      layout: {
        'text-font': ['Roboto Condensed Italic', 'Noto Sans Italic'],
        'text-size': 13,
        'text-field': '{name:latin}',
        'text-justify': 'center',
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#633',
        'text-halo-color': 'rgba(255,255,255,0.7)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['all', ['==', 'class', 'continent']]
    },
    {
      id: 'Aqueduct outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,51%)',
        'line-width': {
          base: 1.3,
          stops: [
            [14, 1],
            [20, 6]
          ]
        }
      },
      filter: ['==', 'brunnel', 'bridge']
    },
    {
      id: 'Aqueduct',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(204,92%,75%)',
        'line-width': {
          base: 1.3,
          stops: [
            [12, 0.5],
            [20, 5]
          ]
        }
      },
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'brunnel', 'bridge']]
    },
    {
      id: 'Cablecar',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 13,
      layout: { 'line-cap': 'round', visibility: 'visible' },
      paint: {
        'line-blur': 1,
        'line-color': 'hsl(0,0%,100%)',
        'line-width': {
          base: 1,
          stops: [
            [13, 2],
            [19, 4]
          ]
        }
      },
      filter: ['==', 'class', 'aerialway']
    },
    {
      id: 'Cablecar dash',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 13,
      layout: {
        'line-cap': 'round',
        'line-join': 'bevel',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0,0%,64%)',
        'line-width': {
          base: 1,
          stops: [
            [13, 1],
            [19, 2]
          ]
        },
        'line-dasharray': [2, 2]
      },
      filter: ['==', 'class', 'aerialway']
    },
    {
      id: 'Other border',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 3,
      maxzoom: 22,
      layout: { visibility: 'visible' },
      paint: {
        'line-color': 'hsl(0, 0%, 70%)',
        'line-width': [
          'interpolate',
          ['linear', 1],
          ['zoom'],
          3,
          0.75,
          4,
          0.8,
          11,
          ['case', ['<=', ['get', 'admin_level'], 6], 1.75, 1.5],
          18,
          ['case', ['<=', ['get', 'admin_level'], 6], 3, 2]
        ],
        'line-dasharray': [2, 1]
      },
      filter: ['all', ['in', 'admin_level', 3, 4, 5, 6, 7, 8, 9, 10], ['==', 'maritime', 0]]
    },
    {
      id: 'Disputed border',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 0,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0, 0%, 63%)',
        'line-width': {
          stops: [
            [1, 0.5],
            [5, 1.5],
            [10, 2],
            [24, 12]
          ]
        },
        'line-dasharray': [2, 2]
      },
      filter: ['all', ['==', 'admin_level', 2], ['==', 'disputed', 1], ['==', 'maritime', 0]]
    },
    {
      id: 'Country border',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 0,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': 'hsl(0, 0%, 54%)',
        'line-width': {
          stops: [
            [1, 0.5],
            [5, 1.5],
            [10, 2],
            [24, 12]
          ]
        }
      },
      filter: ['all', ['==', 'admin_level', 2], ['==', 'disputed', 0], ['==', 'maritime', 0]]
    },
    {
      id: 'River labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      minzoom: 13,
      layout: {
        'text-font': ['Roboto Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [12, 8],
            [16, 14],
            [22, 20]
          ]
        },
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        visibility: 'visible',
        'symbol-spacing': 400,
        'text-max-width': 5,
        'symbol-placement': 'line',
        'text-letter-spacing': 0.2,
        'text-rotation-alignment': 'map'
      },
      paint: {
        'text-color': 'hsl(205,84%,39%)',
        'text-halo-blur': 1,
        'text-halo-color': 'hsl(202, 76%, 82%)',
        'text-halo-width': {
          stops: [
            [10, 1],
            [18, 2]
          ]
        }
      },
      filter: ['==', '$type', 'LineString']
    },
    {
      id: 'Ocean labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 0,
      layout: {
        'text-font': ['Roboto Italic', 'Noto Sans Italic'],
        'text-size': [
          'interpolate',
          ['linear', 1],
          ['zoom'],
          1,
          ['match', ['get', 'class'], ['ocean'], 14, 10],
          3,
          ['match', ['get', 'class'], ['ocean'], 18, 14],
          9,
          ['match', ['get', 'class'], ['ocean'], 22, 18],
          14,
          ['match', ['get', 'class'], ['lake'], 14, ['sea'], 20, 26]
        ],
        'text-field': '{name:en}',
        visibility: 'visible',
        'text-max-width': 5,
        'symbol-placement': 'point'
      },
      paint: {
        'text-color': {
          stops: [
            [1, 'hsl(203,54%,54%)'],
            [4, 'hsl(203,72%,39%)']
          ]
        },
        'text-opacity': [
          'step',
          ['zoom'],
          0,
          1,
          ['match', ['get', 'class'], ['ocean'], 1, 0],
          3,
          1
        ],
        'text-halo-blur': 1,
        'text-halo-color': {
          stops: [
            [1, 'hsla(196, 72%, 80%, 0.05)'],
            [3, 'hsla(200, 100%, 88%, 0.75)']
          ]
        },
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'Point'], ['has', 'name'], ['!=', 'class', 'lake']]
    },
    {
      id: 'Lake labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      minzoom: 0,
      layout: {
        'text-font': ['Roboto Italic', 'Noto Sans Italic'],
        'text-size': {
          stops: [
            [10, 13],
            [14, 16],
            [22, 20]
          ]
        },
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        visibility: 'visible',
        'text-max-width': 5,
        'symbol-placement': 'line',
        'text-letter-spacing': 0.1
      },
      paint: {
        'text-color': 'hsl(205,84%,39%)',
        'text-halo-color': 'hsla(0, 100%, 100%, 0.45)',
        'text-halo-width': 1.5
      },
      metadata: {},
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'lake']]
    },
    {
      id: 'Housenumber',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'housenumber',
      minzoom: 18,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': 10,
        'text-field': '{housenumber}',
        visibility: 'visible'
      },
      paint: {
        'text-color': 'hsl(26,10%,44%)',
        'text-halo-blur': 1,
        'text-halo-color': 'hsl(21,64%,96%)',
        'text-halo-width': 1
      }
    },
    {
      id: 'Gondola',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 13,
      layout: {
        'text-font': ['Roboto Italic', 'Noto Sans Italic'],
        'text-size': {
          base: 1,
          stops: [
            [13, 11],
            [15, 12],
            [18, 13],
            [22, 14]
          ]
        },
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        visibility: 'visible',
        'text-anchor': 'center',
        'text-offset': [0.8, 0.8],
        'symbol-placement': 'line'
      },
      paint: {
        'text-color': 'hsl(0,0%,40%)',
        'text-halo-blur': 1,
        'text-halo-color': 'hsl(0,0%,100%)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: ['in', 'subclass', 'gondola', 'cable_car']
    },
    {
      id: 'Ferry',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 12,
      layout: {
        'text-font': ['Roboto Italic', 'Noto Sans Italic'],
        'text-size': {
          base: 1,
          stops: [
            [13, 11],
            [15, 12]
          ]
        },
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        visibility: 'visible',
        'text-anchor': 'center',
        'text-offset': [0.8, 0.8],
        'symbol-placement': 'line'
      },
      paint: {
        'text-color': 'hsl(205,84%,39%)',
        'text-halo-blur': 0.5,
        'text-halo-color': 'hsla(0, 0%, 100%, 0.15)',
        'text-halo-width': 1
      },
      filter: ['==', 'class', 'ferry']
    },
    {
      id: 'Oneway',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 16,
      layout: {
        'icon-size': {
          stops: [
            [16, 0.7],
            [19, 1]
          ]
        },
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'icon-image': 'oneway',
        visibility: 'visible',
        'icon-rotate': ['match', ['get', 'oneway'], 1, 0, 0],
        'icon-padding': 2,
        'symbol-spacing': 75,
        'symbol-placement': 'line',
        'icon-rotation-alignment': 'map'
      },
      paint: { 'icon-color': 'hsl(0, 0%, 65%)', 'icon-opacity': 0.5 },
      filter: [
        'all',
        ['has', 'oneway'],
        ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']
      ]
    },
    {
      id: 'Road labels',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 8,
      layout: {
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': {
          stops: [
            [13, 10],
            [14, 11],
            [18, 13],
            [22, 15]
          ]
        },
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        visibility: 'visible',
        'text-anchor': 'center',
        'text-offset': [0, 0.15],
        'text-justify': 'center',
        'text-optional': false,
        'text-max-width': 10,
        'symbol-placement': 'line',
        'icon-keep-upright': false,
        'icon-allow-overlap': false,
        'text-allow-overlap': false,
        'icon-ignore-placement': false,
        'text-ignore-placement': false
      },
      paint: {
        'icon-color': 'hsl(0, 0%, 16%)',
        'text-color': 'hsl(0, 0%, 16%)',
        'text-halo-blur': 0.5,
        'text-halo-color': 'hsl(0,0%,100%)',
        'text-halo-width': 1
      },
      metadata: {},
      filter: [
        'all',
        ['!in', 'subclass', 'gondola', 'cable_car'],
        ['!in', 'class', 'ferry', 'service']
      ]
    },
    {
      id: 'Highway junction',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 16,
      layout: {
        'icon-size': 1,
        'text-font': ['Roboto Regular', 'Noto Sans Regular'],
        'text-size': 9,
        'icon-image': 'exit_{ref_length}',
        'text-field': '{ref}',
        visibility: 'visible',
        'text-offset': [0, 0.1],
        'symbol-spacing': 200,
        'symbol-z-order': 'auto',
        'symbol-placement': 'point',
        'symbol-avoid-edges': true,
        'icon-rotation-alignment': 'viewport',
        'text-rotation-alignment': 'viewport'
      },
      paint: {
        'text-color': 'hsl(0,0%,21%)',
        'text-halo-color': 'hsl(0,0%,100%)',
        'text-halo-width': 1
      },
      filter: [
        'all',
        ['>', 'ref_length', 0],
        ['==', '$type', 'Point'],
        ['==', 'subclass', 'junction']
      ]
    },
    {
      id: 'Highway shield',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 8,
      layout: {
        'icon-size': 1,
        'text-font': [
          'match',
          ['get', 'class'],
          'motorway',
          ['literal', ['Roboto Bold', 'Noto Sans Bold']],
          ['literal', ['Roboto Regular']]
        ],
        'text-size': 10,
        'icon-image': 'road_{ref_length}',
        'text-field': '{ref}',
        visibility: 'visible',
        'text-offset': [0, 0.05],
        'text-padding': 2,
        'symbol-spacing': {
          stops: [
            [10, 200],
            [18, 400]
          ]
        },
        'text-transform': 'uppercase',
        'symbol-placement': 'line',
        'symbol-avoid-edges': true,
        'icon-rotation-alignment': 'viewport',
        'text-rotation-alignment': 'viewport'
      },
      paint: {
        'icon-color': 'hsl(0, 0%, 100%)',
        'text-color': 'hsl(0, 0%, 29%)',
        'icon-halo-color': 'hsl(0, 0%, 29%)',
        'icon-halo-width': 1,
        'text-halo-color': 'hsl(0, 0%, 100%)',
        'text-halo-width': 1
      },
      filter: [
        'all',
        ['<=', 'ref_length', 6],
        ['==', '$type', 'LineString'],
        ['!in', 'network', 'us-interstate', 'us-highway', 'us-state'],
        ['!in', 'class', 'path']
      ]
    }
  ],
  glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${process.env.REACT_APP_MAPTILER_API_KEY}`,
  sprite: 'https://api.maptiler.com/maps/streets/sprite'
};
