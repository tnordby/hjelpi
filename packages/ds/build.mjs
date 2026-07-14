/**
 * Builds @hjelpi/ds: ESM bundle via esbuild + concatenated stylesheet.
 * Run from packages/ds: `node build.mjs` (esbuild resolves from the repo root).
 */
import { build } from 'esbuild'
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises'

await mkdir('dist', { recursive: true })

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
})

// Flatten the two-file CSS into one dist stylesheet, fonts path rewritten
// to sit next to it (dist/../fonts → ../fonts still resolves from dist/).
const tokens = await readFile('src/styles/tokens.css', 'utf8')
const components = await readFile('src/styles/components.css', 'utf8')
await writeFile('dist/styles.css', `${tokens}\n${components}`)
await cp('fonts', 'dist/fonts', { recursive: true })
await writeFile(
  'dist/styles.css',
  (await readFile('dist/styles.css', 'utf8')).replaceAll("url('../fonts/", "url('./fonts/"),
)

console.log('built dist/index.js + dist/styles.css + dist/fonts/')
