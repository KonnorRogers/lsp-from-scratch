import assert from "node:assert"
import {test} from "node:test"
import {decodeMessage, encodeMessage} from "lsp-from-scratch/exports/rpc.js"

test("Test encoding", () => {
  const msg = {Testing: true}

  const contentLength = JSON.stringify(msg).length
  const expected = "Content-Length: " + (16).toString() + "\r\n\r\n" + "{\"Testing\":true}"
  const actual = encodeMessage(msg)

  assert.equal(
    expected,
    actual
  )
})


test("Test decoding", () => {
  const incomingMessage = "Content-Length: " + (15).toString() + "\r\n\r\n" + "{\"method\":\"hi\"}"
  const { contentLength, method } = decodeMessage(incomingMessage)
  assert.equal(contentLength, 15)

  assert.equal(method, "hi")
})
