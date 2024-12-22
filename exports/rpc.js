/**
 * @param {unknown} msg
 */
export function encodeMessage (msg) {
  const escapedMsg = JSON.stringify(msg)

  return `Content-Length: ${escapedMsg.length}\r\n\r\n${escapedMsg}`
}

/**
 * @param {string} msg
 */
export function decodeMessage (msg) {
  const [header, content] = msg.split(/\r\n\r\n/)

  if (!header && !content) {
    throw Error("No header of content found")
  }

  // Content-Length: number
  const contentLength = Number(header.split(/: /)[1])
  if (contentLength == null) { throw Error("No 'Content-Length: <number>' found") }

  const baseMessage = /** @type {Omit<import("../internal/lsp-types.js").RequestMessage, "contentLength">}} */ (JSON.parse(content))

  return /** @type {const} */ ({
    contentLength,
    ...baseMessage
  })
}
