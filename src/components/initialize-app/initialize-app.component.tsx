import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin, setCredentials, setGuestState, selectCurrentUser } from "@/redux/slices/auth.slice";
import { safeSetUser } from "@/lib/faro";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import { getAuthRouteHeaders } from "@/utils/api/auth/auth-route-headers";
import { GUEST_CART_STORAGE_KEY } from "@/utils/api/cart/cart.util";
import { clearCheckoutSessionId, getOrCreateAnonymousId } from "@/utils/session/anonymous-session.util";
import { useCartSync } from "@/hooks/cart/use-cart-sync.hook";
import { useEffect } from "react";

export default function InitializeApp() {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const currentUser = useAppSelector(selectCurrentUser);

  useCartSync();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
          method: "GET",
          headers: getAuthRouteHeaders(),
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          dispatch(setGuestState());
          return;
        }

        const payload = (await response.json()) as { success?: boolean; user?: AuthUser };
        if (!payload.user) {
          dispatch(setGuestState());
          return;
        }

        dispatch(
          setCredentials({
            accessToken: null,
            refreshToken: null,
            user: payload.user,
          }),
        );
        clearCheckoutSessionId();
      } catch {
        dispatch(setGuestState());
      }
    };

    void bootstrapAuth();

    return () => {
      // no-op
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    if (isLogin && currentUser?.id) {
      safeSetUser({ id: currentUser.id });
    } else {
      safeSetUser(undefined);
    }
  }, [isAuthResolved, isLogin, currentUser?.id]);

  const handleUpdateScheme = (matcher: MediaQueryList) => () => {
    const lightSchemeIcon = document.querySelector("link#light-scheme-icon")!;
    const darkSchemeIcon = document.querySelector("link#dark-scheme-icon")!;
    if (matcher.matches) {
      document.head.append(darkSchemeIcon);
    } else {
      document.head.append(lightSchemeIcon);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        localStorage.removeItem(`persist:${GUEST_CART_STORAGE_KEY}`);
      } catch {
        // ignore quota / private browsing
      }

      getOrCreateAnonymousId();

      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = handleUpdateScheme(matcher);
      matcher.addListener(handler);
      handler();
      return () => {
        matcher.removeListener(handler);
      };
    }
  }, []);

  return null;
}
