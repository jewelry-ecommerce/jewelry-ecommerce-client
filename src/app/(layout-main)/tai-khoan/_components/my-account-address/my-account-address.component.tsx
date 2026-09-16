"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Typography, Skeleton, useTheme, useMediaQuery, Stack } from "@mui/material";
import useStyles from "./my-account-address.styles";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import EmptyComponent from "@/components/empty/empty.component";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import { useAppSelector } from "@/redux/hooks";
import { Address } from "@/utils/api/checkout/checkout.interface";
import MyAccountAddressAddDialog from "./components/my-account-address-add-dialog.component";
import MyAccountAddressUpdateDialog from "./components/my-account-address-update-dialog.component";
import { useMyAccountAddress } from "./hooks/my-account-address.hook";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog/delete-confirmation-dialog.component";
import { Plus } from "@untitledui/icons";
import { useRouter } from "next/navigation";

export interface MyAccountAddressHandle {
  openAddDialog: () => void;
}

interface MyAccountAddressProps {
  isLoading?: boolean;
}

const SectionSkeleton = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.sectionCard}>
      <Skeleton variant="text" width={180} height={32} />
      <Stack spacing={2}>
        {[1, 2].map((i) => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: "4px" }} />
        ))}
      </Stack>
    </Box>
  );
};

const MyAccountAddress = forwardRef<MyAccountAddressHandle, MyAccountAddressProps>(function MyAccountAddress(
  { isLoading: propIsLoading = false },
  ref,
) {
  const { classes } = useStyles();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const user = useAppSelector((state) => state.auth.user);

  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [activeProvinceCode, setActiveProvinceCode] = useState<number>(0);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [addressIdToDelete, setAddressIdToDelete] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    openAddDialog: () => setOpenAdd(true),
  }));

  const { addresses, isLoading: isAddressesLoading, deleteUserAddress, isDeleting } = useMyAccountAddress(activeProvinceCode);

  const isLoading = propIsLoading || isAddressesLoading;
  const hasAddresses = addresses.length > 0;

  const handleOpenUpdate = (address: Address) => {
    setSelectedAddress(address);
    setActiveProvinceCode(address.provinceCode);
    setOpenUpdate(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setActiveProvinceCode(0);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedAddress(null);
    setActiveProvinceCode(0);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setAddressIdToDelete(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setAddressIdToDelete(null);
    setOpenDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (addressIdToDelete) {
      await deleteUserAddress(addressIdToDelete, {
        onSuccess: () => handleCloseDeleteConfirm(),
      });
    }
  };

  return (
    <Stack id="so-dia-chi" sx={{ gap: "24px" }}>
      {!isMobile && (
        <StackRowAlignCenterJustBetween>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.xl.bold,
              color: "#27251F",
              textTransform: "uppercase",
            }}
          >
            Sổ địa chỉ
          </Typography>
          <Box component="button" className={classes.addButton} onClick={() => setOpenAdd(true)}>
            <Plus size={24} color="#525252" />
            <Typography className={classes.addButtonText}>Thêm địa chỉ</Typography>
          </Box>
        </StackRowAlignCenterJustBetween>
      )}

      {isLoading ? (
        <SectionSkeleton />
      ) : !hasAddresses ? (
        <EmptyComponent
          url="/image/icons/icon-empty-address.svg"
          title="Chưa có địa chỉ"
          subtitle="Thêm địa chỉ của bạn để mua sắm nhanh chóng và tiện lợi hơn."
          titleSx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, textTransform: "uppercase" }}
          buttonText="Bắt Đầu Mua Sắm"
          onClick={() => router.push("/san-pham")}
        />
      ) : (
        <Stack spacing={2}>
          {[...addresses]
            .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
            .map((address) => (
              <Stack key={address.id} className={classes.addressItem}>
                <StackRowAlignCenterJustBetween sx={{ gap: "12px" }}>
                  <StackRowAlignCenter>
                    <Typography className={classes.name}>{`${address.firstName || ""}`.trim()}</Typography>
                    {address.isDefault && <Box className={classes.badge}>Mặc định</Box>}
                  </StackRowAlignCenter>
                  <StackRowAlignCenter sx={{ gap: "12px" }}>
                    <Typography className={classes.actionLink} onClick={() => handleOpenUpdate(address)}>
                      Cập nhật
                    </Typography>
                    <Box className={classes.divider} />
                    <Typography className={classes.actionLink} onClick={() => handleOpenDeleteConfirm(address.id)}>
                      Xoá
                    </Typography>
                  </StackRowAlignCenter>
                </StackRowAlignCenterJustBetween>

                <Stack sx={{ gap: "4px" }}>
                  <Typography className={classes.detailsText}>{address.receiverPhone}</Typography>
                  <Typography
                    className={classes.detailsText}
                  >{`${address.addressLine}, ${address.wardName}, ${address.provinceName}`}</Typography>
                </Stack>
                {address.isDefault && <Box className={classes.badgeMobile}>Mặc định</Box>}
              </Stack>
            ))}
        </Stack>
      )}

      <MyAccountAddressAddDialog
        open={openAdd}
        onClose={handleCloseAdd}
        currentUser={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          phone: user?.phone,
        }}
      />

      <MyAccountAddressUpdateDialog open={openUpdate} onClose={handleCloseUpdate} address={selectedAddress} />

      <DeleteConfirmationDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="BẠN CHẮC CHẮN MUỐN XÓA ĐỊA CHỈ NÀY?"
      />
    </Stack>
  );
});

export default MyAccountAddress;
