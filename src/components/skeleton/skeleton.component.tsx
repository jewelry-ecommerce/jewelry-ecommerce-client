import React from "react";
import { Box, Skeleton } from "@mui/material";

export type PageSkeletonProps = {
  rows?: number;
  columns?: number;
};

const PageSkeleton = ({ rows = 5, columns = 1 }: PageSkeletonProps) => {
  return (
    <Box sx={{ p: 2, display: "grid", gap: 2 }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Box key={`skele-row-${idx}`} sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 2 }}>
          {Array.from({ length: columns }).map((__, idx2) => (
            <Box key={`skele-col-${idx2}`}>
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PageSkeleton;
