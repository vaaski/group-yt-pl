import { join } from "path"

export const p = (path: string): string => join(__dirname, "..", path)
