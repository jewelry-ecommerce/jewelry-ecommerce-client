import { useCallback } from "react";
import { toast } from "react-toastify";

const FEATURE_DEVELOPING_MESSAGE = "tính năng đang được phát triển";

const useFeatureDevelopingToast = () => {
  const showFeatureDevelopingToast = useCallback(() => {
    toast.info(FEATURE_DEVELOPING_MESSAGE);
  }, []);

  return {
    showFeatureDevelopingToast,
  };
};

export default useFeatureDevelopingToast;
