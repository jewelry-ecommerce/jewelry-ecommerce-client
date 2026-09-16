import { useMemo } from "react";
import { getAccessToken, hasAccessToken } from "@/utils/auth/access-token.util";

const useAccessToken = () => {
  const accessToken = useMemo(() => getAccessToken(), []);
  const isAuthenticated = useMemo(() => hasAccessToken(), []);

  // eslint-disable-next-line no-console
  console.log("accessToken", accessToken);
  // eslint-disable-next-line no-console
  console.log("isAuthenticated", isAuthenticated);

  return {
    accessToken,
    isAuthenticated,
  };
};

export default useAccessToken;
