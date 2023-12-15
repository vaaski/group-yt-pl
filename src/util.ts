import { join } from "path"

import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const p = (path: string): string => join(__dirname, "..", path)
