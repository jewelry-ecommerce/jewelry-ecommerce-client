/** Client currently targets the local mock API; disable when integrating the real BE. */
export const IS_JEWELRY_DEMO_MODE = process.env.NEXT_PUBLIC_BACKEND_PROVIDER?.toUpperCase() !== "JAVA";
