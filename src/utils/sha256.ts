import { createHash } from "crypto"

export const sha256 = (text: string): string => {
  return createHash("sha256").update(text).digest("hex")
}