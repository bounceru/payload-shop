const fs = require('fs')
const path = require('path')

function patchFile(filePath, original, replacement) {
  const fullPath = path.resolve(__dirname, '..', filePath)
  let code = fs.readFileSync(fullPath, 'utf8')

  if (!code.includes(replacement)) {
    code = code.replace(original, replacement)
    fs.writeFileSync(fullPath, code)
    console.log(`✅ Patched ${filePath}`)
  } else {
    console.log(`✓ Already patched: ${filePath}`)
  }
}

patchFile(
  'node_modules/.pnpm/@expo+metro-config@0.20.14/node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
  `const importLocationsPlugin_1 = require("metro/src/ModuleGraph/worker/importLocationsPlugin");`,
  `const importLocationsPlugin_1 = { locToKey: () => {} };`,
)

patchFile(
  'node_modules/.pnpm/@expo+metro-config@0.20.14/node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js',
  `require("metro/src/ModuleGraph/worker/importLocationsPlugin")`,
  `{ locToKey: () => {} }`,
)
