/**
 * {import("../internal/lsp-types.ts")}
 */

/**
 * @param {ReturnType<import("./rpc.js").decodeMessage>} req
 * @returns {import("../internal/lsp-types.js").ResponseMessage & { result: import("../internal/lsp-types.js").InitializeResult}}
 */
export function initializeResponse (req) {
  return {
	id: req.id.toString(),
	jsonrpc: req.jsonrpc,
	result: {
		capabilities: {
			textDocumentSync: 1,
			hoverProvider: true,
			definitionProvider: true,
			codeActionProvider: true,
			completionProvider: {},
			diagnosticProvider: {},
		},
		serverInfo: {
			name: "lsp-from-scratch",
			version: "1.0.0.0.0.0.0.0",
		}
	}
  }
}

