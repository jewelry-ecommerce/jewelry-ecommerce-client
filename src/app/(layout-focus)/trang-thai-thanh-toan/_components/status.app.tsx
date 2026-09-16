"use client";
import React, { Suspense } from "react";
import StatusView from "./status.view";

const StatusApp = () => {
  return (
    <Suspense fallback={null}>
      <StatusView />
    </Suspense>
  );
};

export default StatusApp;
