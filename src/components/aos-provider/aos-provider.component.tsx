import React, { useEffect, useRef } from "react";
import { createContext } from "react";
import AOS, { type Aos } from "aos";

export const AOSContext = createContext<Aos | undefined>(undefined);

export default function AOSProvider({ children }: { children: React.ReactNode }) {
  const aosRef = useRef(AOS);

  useEffect(() => {
    aosRef.current.init();
  }, []);

  return <AOSContext.Provider value={aosRef.current}>{children}</AOSContext.Provider>;
}
