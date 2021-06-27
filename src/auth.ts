import type { Secret } from "../types/Google"
import type { Credentials } from "google-auth-library"

import { execSync } from "child_process"
import { read, write } from "fs-jetpack"
import { OAuth2Client } from "google-auth-library"
import { createInterface } from "readline"
import { p } from "./util"

const SECRET_FILE = p("client_secret.json")
const TOKEN_FILE = p("token.json")
const secret = read(SECRET_FILE, "json") as Secret | null
let token = read(TOKEN_FILE, "json") as Credentials | null

const OAuth2 = OAuth2Client

const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
]

const ask = (question: string): Promise<string> => {
  return new Promise(res => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(`${question} `, reply => {
      rl.close()
      res(reply)
    })
  })
}

export default async (): Promise<OAuth2Client> => {
  if (!secret) {
    console.log("provide client_secret.json")
    execSync(`code ${SECRET_FILE}`)
    process.exit(1)
  }

  const { client_id, client_secret, redirect_uris } = secret.installed
  const o2c = new OAuth2(client_id, client_secret, redirect_uris[0])

  if (!token) {
    const authURL = o2c.generateAuthUrl({
      access_type: "offline",
      scope,
    })
    console.log(authURL)

    const code = await ask("\ncode:")
    token = (await o2c.getToken(code)).tokens
    write(TOKEN_FILE, token)
  }

  o2c.credentials = token

  return o2c
}
