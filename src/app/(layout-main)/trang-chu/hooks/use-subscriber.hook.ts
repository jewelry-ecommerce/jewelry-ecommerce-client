import { useState } from "react";
import { toast } from "react-toastify";
import { CustomerRequestApi } from "@/utils/api";
import { EMAIL_REGEX, VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import { getErrorMessage } from "@/utils/helpers/axios";

export const useSubscriber = () => {
  const [value, setValue] = useState("");
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChangeValue = (newValue: string) => {
    setValue(newValue);
    setErrorMsg("");
  };

  const handleChangePrivacyPolicy = (checked: boolean) => {
    setPrivacyPolicyAccepted(checked);
    setErrorMsg("");
  };

  const handleSubscribe = async () => {
    if (isLoading) return;

    const email = value.trim();
    if (!privacyPolicyAccepted) {
      setErrorMsg("Vui lòng đồng ý chính sách bảo mật trước khi tiếp tục.");
      return;
    }
    if (email && !EMAIL_REGEX.test(email)) {
      setErrorMsg(VALIDATION_MESSAGES.email);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await CustomerRequestApi.postNewsletterRequest({ email });
      toast.success("Cảm ơn bạn! Đăng ký nhận tin thành công.");
      setValue("");
      setPrivacyPolicyAccepted(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error) || "Không thể đăng ký nhận tin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    value,
    privacyPolicyAccepted,
    onChange: handleChangeValue,
    onChangePrivacyPolicy: handleChangePrivacyPolicy,
    onSubmit: handleSubscribe,
    loading: isLoading,
    errorMsg,
  };
};
