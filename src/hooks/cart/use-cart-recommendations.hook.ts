import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { CartApi } from "@/utils/api";
import { CartRecommendationProduct } from "@/utils/api/cart/cart.interface";
import { getCartApiOptions } from "@/utils/api/cart/cart.util";
import { isTextAttributeDisplayType } from "@/utils/constants/attribute-display-type.enum";

export const useCartRecommendations = (enabled = false) => {
  const [recommendedProducts, setRecommendedProducts] = useState<CartRecommendationProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);

  useEffect(() => {
    if (!enabled || !isAuthResolved) return;

    let mounted = true;
    const cartApiOptions = getCartApiOptions(isLogin);

    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await CartApi.getCartRecommendations(cartApiOptions, { page: 1, take: 10 });
        const data = response.list.map((item) => {
          const sizeAttribute = item.attributes?.find((attr) => isTextAttributeDisplayType(attr.displayType));
          return {
            ...item,
            size: sizeAttribute?.value || "",
          };
        });

        if (!mounted) return;

        setRecommendedProducts(data);
      } catch (error) {
        console.error("Failed to load cart recommendations", error);
        if (mounted) {
          setRecommendedProducts([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      mounted = false;
    };
  }, [enabled, isAuthResolved, isLogin]);

  return { recommendedProducts, isLoading };
};
