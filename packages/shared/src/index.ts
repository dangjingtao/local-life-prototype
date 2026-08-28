export type ClientKind = "pc" | "mobile";
export type PrototypeEnvironment = "development" | "production";

export interface PrototypeMeta {
  name: string;
  title: string;
}

export * from "./domain";
export * from "./fixtures";
export * from "./pc-access";
export * from "./selectors";
