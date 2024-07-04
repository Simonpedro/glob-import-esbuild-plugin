import { test, mock } from "node:test";
import { resolve } from "node:path";
import assert from "node:assert";
import globImportPlugin from "./index.js";

test("plugin sets up correctly", async () => {
  const resolveDir = resolve();
  const pathUptoThisFolder = resolveDir.replace(
    "/glob-import-esbuild-plugin",
    ""
  );
  const onResolveArgs = {
    resolveDir: resolve(),
    path: "./test_folder/**/*.js",
  };
  const build = {
    onResolve: mock.fn(),
    onLoad: mock.fn(),
  };

  globImportPlugin.setup(build);
  const resolveResult =
    build.onResolve.mock.calls[0].arguments[1](onResolveArgs);

  const loadResult = await build.onLoad.mock.calls[0].arguments[1](
    resolveResult
  );

  assert.strictEqual(build.onResolve.mock.callCount(), 1);
  assert.deepEqual(build.onResolve.mock.calls[0].arguments[0], {
    filter: /(\*\*?)/,
  });
  assert.deepStrictEqual(resolveResult, {
    path: "./test_folder/**/*.js",
    namespace: "glob-import-esbuild-plugin",
    pluginData: {
      resolveDir: "/Users/pedrosimon/hobby/glob-import-esbuild-plugin",
    },
  });

  assert.strictEqual(build.onLoad.mock.callCount(), 1);
  assert.deepEqual(build.onLoad.mock.calls[0].arguments[0], {
    filter: /.*/,
    namespace: "glob-import-esbuild-plugin",
  });
  assert.deepStrictEqual(loadResult, {
    contents: `import * as module0 from './test_folder/aModule.js';
import * as module1 from './test_folder/a_module.js';
import * as module2 from './test_folder/subdirectory/another-module.js'
const modules = Object.fromEntries([['${pathUptoThisFolder}/glob-import-esbuild-plugin/test_folder/aModule.js', module0],['${pathUptoThisFolder}/glob-import-esbuild-plugin/test_folder/a_module.js', module1],['${pathUptoThisFolder}/glob-import-esbuild-plugin/test_folder/subdirectory/another-module.js', module2]]);
export default modules;`,

    resolveDir: "/Users/pedrosimon/hobby/glob-import-esbuild-plugin",
  });
});
