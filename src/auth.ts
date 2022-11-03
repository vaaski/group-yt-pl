import type { Secret } from "../types/Google"
import type { Credentials } from "google-auth-library"

import { execSync } from "child_process"
import { read, write } from "fs-jetpack"
import { OAuth2Client } from "google-auth-library"
import { p } from "./util"
import getPort from "get-port"
import open from "open"
import http from "http"

const SECRET_FILE = p("client_secret.json")
const TOKEN_FILE = p("token.json")
const secret = read(SECRET_FILE, "json") as Secret | null
let token = read(TOKEN_FILE, "json") as Credentials | null

const OAuth2 = OAuth2Client

const scope = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
]

const listenForToken = (o2c: OAuth2Client, port: number, authURL: string) => {
  let gotCode = false

  return new Promise<Credentials>(resolve => {
    const server = http
      .createServer(async (req, res) => {
        if (gotCode) return res.end("got code already")

        // acquire the code from the querystring, and close the web server.
        if (!req.url) throw new Error("no url")

        const qs = new URL(req.url, `http://localhost:${port}`).searchParams
        const code = qs.get("code")
        if (!code) throw new Error("no code")
        gotCode = true

        res.end("Authentication successful! Please return to the console.")
        server.close()

        // Now that we have the code, use that to acquire tokens.
        const r = await o2c.getToken(code)
        resolve(r.tokens)
      })
      .listen(port, () => {
        // open the browser to the authorize url to start the workflow
        open(authURL, { wait: false }).then(cp => cp.unref())
      })
  })
}

export default async (): Promise<OAuth2Client> => {
  if (!secret) {
    console.log("provide client_secret.json")
    execSync(`code ${SECRET_FILE}`)
    return process.exit(1)
  }

  const port = await getPort({ port: 6969 })
  const redirect = `http://localhost:${port}`

  const { client_id, client_secret } = secret.installed
  const o2c = new OAuth2(client_id, client_secret, redirect)

  if (!token) {
    const authURL = o2c.generateAuthUrl({
      access_type: "offline",
      scope,
    })
    console.log(authURL + "\n")

    token = await listenForToken(o2c, port, authURL)
    write(TOKEN_FILE, token)
  }

  o2c.setCredentials(token)

  return o2c
}
