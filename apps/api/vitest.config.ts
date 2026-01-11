import { config } from "@repo/testing/vitest.config";
import { mergeConfig } from "vitest/config";

export default mergeConfig(config, {
  test: {
    environment: "node",
  },
});
