import { SendOtpRegisterResponse } from "@/utils/api/auth/auth.interface";

type RegisterOtpSendSession = {
  phone: string;
  startTime: number;
};

type OtpStorageMeta = {
  date: string;
  sendCount: number;
  blockedUntil: number | null;
};

type RegisterSendOtpRouteResponse = SendOtpRegisterResponse & {
  message?: string;
  statusCode?: number;
};
export type { RegisterOtpSendSession, RegisterSendOtpRouteResponse, OtpStorageMeta };
