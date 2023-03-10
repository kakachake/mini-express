import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/express.ts",
  output: {
    dir: "lib",
    format: "cjs",
  },
  plugins: [commonjs(), nodeResolve(), typescript()],
};
