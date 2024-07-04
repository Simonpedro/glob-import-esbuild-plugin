import FastGlob from "fast-glob";
import { resolve } from "node:path";

const PLUGIN_NAME = "glob-import-esbuild-plugin";
const REGEX_MATCHING_BLOB_PATTERN = /(\*\*?)/;

export default {
  name: PLUGIN_NAME,

  setup(build) {
    build.onResolve(
      { filter: REGEX_MATCHING_BLOB_PATTERN },
      ({ resolveDir, path }) => {
        return {
          path,
          namespace: PLUGIN_NAME,
          pluginData: {
            resolveDir,
          },
        };
      }
    );

    build.onLoad(
      { filter: /.*/, namespace: PLUGIN_NAME },
      async ({ path, pluginData: { resolveDir } }) => {
        const files = (
          await FastGlob(path, {
            cwd: resolveDir,
          })
        ).sort();

        const contents = [
          files
            .map(
              (module, index) => `import * as module${index} from '${module}'`
            )
            .join(";\n"),
          `const modules = Object.fromEntries([${files
            .map(
              (file, index) =>
                `['${resolve(resolveDir, file)}', module${index}]`
            )
            .join(",")}]);`,
          "export default modules;",
        ].join("\n");

        return {
          contents,
          resolveDir,
        };
      }
    );
  },
};
