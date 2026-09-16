import { AuthCard } from "@/components/auth/auth-card";
import { Box, Skeleton } from "@mui/material";

type AuthFormSkeletonProps = {
  fieldCount?: number;
  showSecondaryAction?: boolean;
};

const AuthFormSkeleton = ({ fieldCount = 2, showSecondaryAction = false }: AuthFormSkeletonProps) => {
  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: { xs: 3, md: 5 }, px: 2 }}>
      <AuthCard>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="70%" height={36} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1.5 }} />

        {Array.from({ length: fieldCount }).map((_, idx) => (
          <Skeleton key={`auth-skeleton-field-${idx}`} variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
        ))}

        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 0.5 }} />
        {showSecondaryAction ? <Skeleton variant="text" width={120} height={22} sx={{ mt: 2, ml: "auto" }} /> : null}
      </AuthCard>
    </Box>
  );
};

export default AuthFormSkeleton;
