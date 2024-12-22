export class State {
  constructor () {
    /**
     * @type {Map<string, TextDocument>}
     */
    this.documents = new Map()
  }

  /**
   * @param {string} text
   */
  getDiagnosticsForText (text) {
    /**
     * @type {import("../internal/lsp-types.js").Diagnostic[]}
     */
    const diagnostics = []

    text.split(/\n/).forEach((line, lineIndex) => {
      let term = "VS Code"

      let position = line.indexOf(term);

      if (position !== -1) {
        const start = {
          line: lineIndex,
          character: position,
        }
        const end = {
          line: lineIndex,
          character: position + term.length
        }
        diagnostics.push({
          range: {start, end},
          severity: 2,
          source: "Common Sense",
          message: "Please make sure we use a good language",
        })
      }

      term = "Neovim"
      position = line.indexOf(term, position + 1);

      if (position !== -1) {
        const start = {
          line: lineIndex,
          character: position,
        }
        const end = {
          line: lineIndex,
          character: position + term.length
        }
        diagnostics.push({
          range: {start, end},
          severity: 2,
          source: "Common Sense",
          message: "Great choice :)",
        })
      }
    })
    return diagnostics
  }

  /**
   * @param {TextDocument} textDocument
   * @return {import("../internal/lsp-types.js").Diagnostic[]}
   */
  openTextDocument (textDocument) {
    this.documents.set(textDocument.uri, textDocument)

    return this.getDiagnosticsForText(textDocument.text)
  }

  /**
   * @param {import("../internal/lsp-types.js").VersionedTextDocumentIdentifier} versionedTextDocument
   * @param {import("../internal/lsp-types.js").TextDocumentContentChangeEvent[]} changes
   * @returns {import("../internal/lsp-types.js").Diagnostic[]}
   */
  updateTextDocument (versionedTextDocument, changes) {
    let textDocument = this.documents.get(versionedTextDocument.uri)
    let text = ""

    if (!textDocument) {
      this.openTextDocument(new TextDocument({
        ...versionedTextDocument,
        text,
      }))
      textDocument = /** @type {TextDocument} */ (this.documents.get(versionedTextDocument.uri))
    }

    for (const change of changes) {
      text = change.text
    }
    textDocument.version = versionedTextDocument.version
    textDocument.text = text

    return this.getDiagnosticsForText(textDocument.text)
  }

  /**
    * @param {ReturnType<import("./rpc.js").decodeMessage> & {params: import("../internal/lsp-types.js").HoverParams}} req
    * @returns {import("../internal/lsp-types.js").ResponseMessage & { result: import("../internal/lsp-types.js").Hover }}
    */
  hoverResponse (req) {
    const file = req.params.textDocument.uri
    const id = req.id
    const position = req.params.position

    const textDocument = this.documents.get(file)

    return {
      id: req.id.toString(),
      jsonrpc: req.jsonrpc,
      result: {
        contents: `File: ${file}, Characters: ${textDocument?.text.length || 0}`
      }
    }
  }

  /**
    * @param {ReturnType<import("./rpc.js").decodeMessage> & {params: import("../internal/lsp-types.js").DefinitionParams}} req
    * @returns {import("../internal/lsp-types.js").ResponseMessage & { result: import("../internal/lsp-types.js").DefinitionResponse }}
    */
  goToDefinitionResponse (req) {
    const id = req.id
    const position = req.params.position

    const file = req.params.textDocument.uri

    return {
      id: req.id.toString(),
      jsonrpc: req.jsonrpc,
      result: {
        uri: file,
        range: {
          start: {
            line: position.line - 1,
            character: 0,
          },
          end: {
            line: position.line - 1,
            character: 0,
          }
        }
      }
    }
  }

  /**
    * @param {ReturnType<import("./rpc.js").decodeMessage> & {params: import("../internal/lsp-types.js").CodeActionParams}} req
    * @returns {Omit<import("../internal/lsp-types.js").ResponseMessage, "result"> & { result: import("../internal/lsp-types.js").CodeActionResponse }}
    */
  codeActionResponse (req) {
    /**
     * @type {import("../internal/lsp-types.js").CodeAction[]}
     */
    const actions = []

    const file = req.params.textDocument.uri
    const textDocument = this.documents.get(file)

    if (textDocument) {
      textDocument.text.split(/\n/).forEach((line, lineIndex) => {
        const term = "VS Code"
        let position = line.indexOf(term);

        while (position !== -1) {
          const change = {
            newText: "Neovim",
            range: {
              start: {
                line: lineIndex,
                character: position
              },
              end: {
                line: lineIndex,
                character: position + term.length
              },
            }
          }

          actions.push({
            title: "Replace VS C*de with a superior editor",
            edit: {
              changes: {
                [file]: [ change ]
              }
            }
          })

          actions.push({
            title: "Censor VS C*de",
            edit: {
              changes: {
                [file]: [ {...change, newText: "VS C*de"} ]
              }
            }
          })
          position = line.indexOf(term, position + 1);
        }
      })
    }

    return {
      id: req.id.toString(),
      jsonrpc: req.jsonrpc,
      result: actions
    }
  }

  /**
    * @param {ReturnType<import("./rpc.js").decodeMessage> & {params: import("../internal/lsp-types.js").CompletionParams}} req
    * @returns {Omit<import("../internal/lsp-types.js").ResponseMessage, "result"> & { result: import("../internal/lsp-types.js").CompletionItem[] }}
    */
  completionResponse (req) {
    /**
     * @type {import("../internal/lsp-types.js").CompletionItem[]}
     */
    const items = []

    items.push({
      label: "Neovim (BTW)",
      detail: "Very cool editor",
      documentation: "Way better than VS C*ode",
    })

    return {
      id: req.id.toString(),
      jsonrpc: req.jsonrpc,
      result: items
    }
  }

  /**
    * @param {ReturnType<import("./rpc.js").decodeMessage> & {params: import("../internal/lsp-types.js").PublishDiagnosticsParams}} req
    * @returns {Omit<import("../internal/lsp-types.js").ResponseMessage, "result"> & { result: import("../internal/lsp-types.js").CompletionItem[] }}
    */
  publishDiagnosticsResponse (req) {
    /**
     * @type {import("../internal/lsp-types.js").CompletionItem[]}
     */
    const diagnostics = []

    return {
      id: req.id.toString(),
      jsonrpc: req.jsonrpc,
      result: diagnostics
    }
  }
}

export class TextDocument {
  /**
   * @param {Object} data
   * @param {number} data.version
   * @param {string} data.uri
   * @param {string} data.text
   */
  constructor (data) {
    const {
      version,
      uri,
      text
    } = data

    this.version = version
    this.uri = uri
    this.text = text
  }
}
