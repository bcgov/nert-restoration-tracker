import MapContainer from "../../components/map/MapContainer";
import { Box } from "@mui/material";
const SearchPage = () => {
  return (
    <Box sx={{ height: "100%" }}>
      <MapContainer
        mapId="search_boundary_map"
        fullScreenControl={false}
        scrollWheelZoom={true}
      />
    </Box>
  );
};

export default SearchPage;
