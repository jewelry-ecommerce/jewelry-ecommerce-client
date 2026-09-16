import React, { useCallback, useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pagination,
  PaginationItem,
  useMediaQuery,
  useTheme,
  SxProps,
  Theme,
  Box,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import useStyles from "./pagination.styles";

function PaginationPreviousIcon() {
  return <ChevronLeft size={24} aria-hidden />;
}

function PaginationNextIcon() {
  return <ChevronRight size={24} aria-hidden />;
}

export interface AppPaginationProps {
  total?: number;
  take?: number;
  page?: number;
  scrollToTop?: boolean;
  sx?: SxProps<Theme>;
  siblingCount?: number;
  boundaryCount?: number;
  onChange?: (pagination: { page: number; take: number }) => void;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  itemName?: string;
}

const PaginationComponent = ({
  total = 0,
  take = 48,
  page,
  scrollToTop = true,
  sx,
  siblingCount: propSiblingCount,
  boundaryCount = 1,
  onChange,
  showPageSize = false,
  pageSizeOptions = [48, 60],
  itemName = "sản phẩm",
}: AppPaginationProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // sync take từ url và fallback về take mặc định nếu take không hợp lệ
  const getTakeFromUrl = useCallback(() => {
    const takeParam = searchParams.get("take");
    const parsed = parseInt(takeParam || "0", 10);
    const isValid = !isNaN(parsed) && parsed > 0 && pageSizeOptions.includes(parsed);
    return isValid ? parsed : (pageSizeOptions[0] ?? take);
  }, [searchParams, pageSizeOptions, take]);

  const [pageSize, setPageSize] = useState(getTakeFromUrl());

  useEffect(() => {
    setPageSize(getTakeFromUrl());
  }, [getTakeFromUrl]);

  const siblingCount = propSiblingCount ?? (isMobile ? 0 : 1);
  const count = Math.ceil(total / pageSize) || 1;

  // sync page từ url và fallback về trang cuối nếu page không hợp lệ
  const getPageFromUrl = () => {
    const pageParam = searchParams.get("page");
    const parsed = parseInt(pageParam || "1", 10);
    return isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, count);
  };

  const currentPage = page !== undefined ? Math.min(Math.max(page, 1), count) : getPageFromUrl();

  const createPageUrl = useCallback(
    (pageNumber: number, nextTake?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentTake = nextTake ?? pageSize;

      if (pageNumber === 1) {
        params.delete("page");
      } else {
        params.set("page", String(pageNumber));
      }

      if (currentTake === take) {
        params.delete("take");
      } else {
        params.set("take", String(currentTake));
      }
      // sort key trên url
      const sorted = new URLSearchParams([...params.entries()].sort(([a], [b]) => a.localeCompare(b)));

      const query = sorted.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams, pageSize, take],
  );

  const handleChange = useCallback(
    (_: React.ChangeEvent<unknown>, pageNumber: number) => {
      if (pageNumber !== currentPage && scrollToTop) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: "auto",
          });
        });
      }

      onChange?.({ page: pageNumber, take: pageSize });
    },
    [currentPage, scrollToTop, onChange, pageSize],
  );

  const handlePageSizeChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      const newTake = Number(event.target.value);
      setPageSize(newTake);
      onChange?.({ page: 1, take: newTake });

      const newUrl = createPageUrl(1, newTake);
      router.push(newUrl, { scroll: scrollToTop });
    },
    [onChange, createPageUrl, router, scrollToTop],
  );

  if (total === 0 || (count <= 1 && !showPageSize)) return null;

  return (
    <Box className={classes.wrapper} sx={sx}>
      <Box className={classes.paginationContainer}>
        {count > 0 && (
          <Pagination
            aria-label="pagination navigation"
            className={classes.root}
            count={count}
            page={currentPage}
            onChange={handleChange}
            siblingCount={siblingCount}
            boundaryCount={boundaryCount}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                component={Link}
                href={createPageUrl(Number(item.page) || 1)}
                scroll={false}
                prefetch
                className={classes.paginationItem}
                components={{
                  previous: PaginationPreviousIcon,
                  next: PaginationNextIcon,
                }}
              />
            )}
          />
        )}
      </Box>

      {showPageSize && (
        <Box className={classes.pageSizeWrapper}>
          <Typography className={classes.pageSizeText}>Hiển thị</Typography>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            className={classes.pageSizeSelect}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                className: classes.pageSizeMenuPaper,
              },
            }}
          >
            {pageSizeOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          <Typography className={classes.pageSizeText}>{itemName}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default PaginationComponent;
