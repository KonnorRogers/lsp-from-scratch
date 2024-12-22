#!/usr/bin/env node

import process from "node:process"
import { Logger } from "./logger.js"
import path from "node:path"
import { decodeMessage, encodeMessage } from "./rpc.js";
import { initializeResponse } from "./lsp.js";
import { State, TextDocument } from "./state.js";

const logger = new Logger(path.resolve(process.cwd(), "log.txt"))

process.stdin.resume();

logger.clear()
logger.debug("Started!")

const state = new State()

process.stdin.on("data", (data) => {
  const msg = data.toString()

  const message = decodeMessage(msg)
  const method = message.method

  logger.write("Method received: ", method)

  let response = null

  switch (method) {
    case "initialize": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").InitializeParams}}  */ (message)
      logger.info(`Connected to: ${req.params.clientInfo?.name} ${req.params.clientInfo?.version}`)

      response = encodeMessage(initializeResponse(req))
      break;
    }
    case "textDocument/didOpen": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").DidOpenTextDocumentParams}}  */ (message)

      const doc = req.params.textDocument

      const diagnostics = state.openTextDocument(new TextDocument({
        uri: doc.uri,
        text: doc.text,
        version: doc.version
      }))

      response = encodeMessage(/** @type {{
	      id: number,
	      jsonrpc: string,
        method: "textDocument/publishDiagnostics"
        params: import("../internal/lsp-types.js").PublishDiagnosticsParams
      }} */ ({
        id: req.id,
        jsonrpc: req.jsonrpc,
        method: "textDocument/publishDiagnostics",
        params: {
          uri: doc.uri,
          version: doc.version,
          diagnostics
        }
      }))
      logger.info(`Opened: ${req.params.textDocument.uri}`)
      break;
    }
    case "textDocument/didChange": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").DidChangeTextDocumentParams}}  */ (message)

      const doc = req.params.textDocument
      const changes = req.params.contentChanges

      const diagnostics = state.updateTextDocument(doc, changes)

      response = encodeMessage(/** @type {{
	      id: number,
	      jsonrpc: string,
        method: "textDocument/publishDiagnostics"
        params: import("../internal/lsp-types.js").PublishDiagnosticsParams
      }} */ ({
        id: req.id,
        jsonrpc: req.jsonrpc,
        method: "textDocument/publishDiagnostics",
        params: {
          uri: doc.uri,
          version: doc.version,
          diagnostics
        }
      }))

      logger.info(`Changed: ${req.params.textDocument.uri}`)
      break;
    }
    case "textDocument/hover": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").HoverParams}}  */ (message)

      response = encodeMessage(state.hoverResponse(req))
      logger.info(`Hover`)
      break;
    }
    // Go To Definition
    case "textDocument/definition": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").DefinitionParams}}  */ (message)

      response = encodeMessage(state.goToDefinitionResponse(req))
      logger.info(`Go To Definition`)
      break;
    }
    case "textDocument/codeAction": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").CodeActionParams}}  */ (message)

      response = encodeMessage(state.codeActionResponse(req))
      logger.info("Code Action")
      break;
    }
    case "textDocument/completion": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").CompletionParams}}  */ (message)
      response = encodeMessage(state.completionResponse(req))
      logger.info("Completion")
      break;
    }
    case "textDocument/publishDiagnostics": {
      const req = /** @type {typeof message & {params: import("../internal/lsp-types.js").PublishDiagnosticsParams}}  */ (message)
      logger.info("Diagnostics")
      break;
    }
    default: {
      logger.error("Not handling: ", method)
      break;
    }
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
