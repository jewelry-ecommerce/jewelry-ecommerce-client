import React, { useCallback, useEffect, useState } from "react";
import { Box, Badge } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useStyles from "./header-checkout.style";
import { ShoppingBag02 } from "@untitledui/icons";
import { AppLink } from "@/components";
import CartDrawerComponent, { CartDrawerItem } from "@/app/(layout-main)/gio-hang/_components/cart-drawer.component";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeCartDrawer, selectCartTotalQuantity } from "@/redux/slices/cart.slice";
import { StackAlignCenter, StackAlignJustCenter } from "@/components/styled";
import useCartCheckout from "@/hooks/cart/use-cart-checkout.hook";
import type { CartFulfillmentGroup } from "@/utils/api/cart/cart-availability.util";
import { useLogoSrc } from "@/components/providers.component";

const HeaderCheckout = () => {
  const logoSrc = useLogoSrc();
  const router = useRouter();
  const { classes } = useStyles();
  const [cartOpen, setCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const cartItemsFromStore = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const cartTotalQuantity = useAppSelector(selectCartTotalQuantity);
  const dispatch = useAppDispatch();
  const { initiateCheckoutFromCart, isInitiatingCheckout } = useCartCheckout();

  const handleDrawerCheckout = useCallback(
    async (options?: { fulfillmentGroup?: CartFulfillmentGroup }) => {
      await initiateCheckoutFromCart({
        mode: "all-eligible",
        fulfillmentGroup: options?.fulfillmentGroup,
        onBeforeNavigate: () => {
          setCartOpen(false);
          dispatch(closeCartDrawer());
        },
      });
    },
    [dispatch, initiateCheckoutFromCart],
  );
  return (
    <Box component="header" className={classes.root}>
      <StackAlignJustCenter className={classes.headerMain}>
        <AppLink href="/" className={classes.logo}>
          <Image src={logoSrc} alt="Logo" width={117} height={37} />
        </AppLink>

        <StackAlignCenter className={classes.actionIcons}>
          <StackAlignJustCenter className={`${classes.iconButton} shopping-cart`} onClick={() => setCartOpen(true)}>
            <Badge
              badgeContent={isHydrated ? cartTotalQuantity : 0}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "rgba(247, 209, 112, 1)",
                  color: "#000",
                },
              }}
            >
              <ShoppingBag02 size={20} color="#333333" />
            </Badge>
          </StackAlignJustCenter>
        </StackAlignCenter>
      </StackAlignJustCenter>

      <CartDrawerComponent
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItemsFromStore && cartItemsFromStore.length > 0 ? (cartItemsFromStore as CartDrawerItem[]) : []}
        onCheckout={handleDrawerCheckout}
        onGoToCart={() => {
          setCartOpen(false);
          router.push("/gio-hang");
        }}
        isInitiatingCheckout={isInitiatingCheckout}
      />
    </Box>
  );
};

export default HeaderCheckout;
