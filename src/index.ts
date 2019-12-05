import amazer from "./amazer";

export default amazer;

export * from "./domain/common";
export * from "./domain/area";

export * from "./generator/base";
export * from "./generator/nystrom";
export * from "./generator/simple";

export * from "./modifier/base";
export * from "./modifier/breakPassages";
export * from "./modifier/removeDeadends";
export * from "./modifier/simple";

export * from "./amazer";
export * from "./serialize";
export * from "./solver";
export * from "./util";