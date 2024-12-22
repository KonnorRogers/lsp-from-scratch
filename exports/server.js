#!/usr/bin/env node

import process from "node:process"
import { Logger } from "./logger.js"
import path from "node:path"
import { decodeMessage, encodeMessage } from "./rpc.js";
import { initializeResponse } from "./lsp.js";

const logger = new Logger(path.resolve(process.cwd(), "log.txt"))

process.stdin.resume();

logger.clear()
logger.debug("Started!")

process.stdin.on("data", (data) => {
  const msg = data.toString()

  const message = decodeMessage(msg)
  const method = message.method

  logger.write("Method received: ", method)

  let response = null
  let req = null

  switch (method) {
    case "initialize":
      req = /** @type {typeof message & {params: import("../internal/lsp-types.js").InitializeParams}}  */ (message)
      logger.info(`Connected to: ${req.params.clientInfo?.name} ${req.params.clientInfo?.version}`)

      response = encodeMessage(initializeResponse(req))
      break;
    case "textDocument/didOpen":
      req = /** @type {typeof message & {params: import("../internal/lsp-types.js").DidOpenTextDocumentParams}}  */ (message)
      // response = encodeMessage(didOpenResponse(req))

      logger.info(`Opened: ${req.params.textDocument.uri}`)
      break;
    default:
      logger.error("Not handling: ", method)
      break;
  }

  if (response) {
    process.stdout.write(response)
    logger.info("Sent the response")
  }
})

// process.stdin.on("close", () => {
//   process.exit(0)
// })

process.on("SIGINT", () => {
  console.log("Shutting down...")
  process.exit(0)
})

process.on("SIGHUP", () => {
  console.log("Shutting down...")
  process.exit(0)
})
