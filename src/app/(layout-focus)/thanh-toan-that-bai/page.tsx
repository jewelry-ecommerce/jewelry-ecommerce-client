import { Box } from "@mui/material";
import FailedStatus from "../trang-thai-thanh-toan/_components/failed-status.component";

export default function DemoFailedPaymentPage() {
  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: { xs: 4, md: 8 }, px: 2 }}>
      <FailedStatus />
    </Box>
  );
}
