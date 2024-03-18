import MapContainer from "../../components/map/MapContainer2";
import { Box } from "@mui/material";
const SearchPage = () => {
  return (
    <Box sx={{ height: "100%" }}>
      <MapContainer mapId="search_boundary_map" center={[-124, 57]} zoom={6} />
    </Box>
  );
};

export default SearchPage;
