import * as fs from "node:fs"

export class Logger {
  static logLevels = {
    debug: 1,
    info: 2,
    warning: 3,
    error: 4,
    critical: 5,
  }

  /**
   * @param {string} file
   * @param {keyof typeof Logger.logLevels} [logLevel="debug"]
   */
  constructor (file, logLevel = "debug") {
    this.file = file
    this.level = logLevel

  }

  /**
   * Clears the file so you can start the logger fresh.
   */
  clear () {
    fs.writeFileSync(this.file, "")
  }

  get logLevels () {
    return /** @type {typeof Logger} */ (this.constructor).logLevels
  }

  /**
   * @param {keyof typeof Logger.logLevels} logLevel
   * @param {...(string | Uint8Array)} messages
   */
  #logFor (logLevel, ...messages) {
    if (this.logLevels[logLevel] >= this.logLevels[this.level]) {
      [...messages].forEach((message) => {
        fs.appendFileSync(this.file, `[${logLevel}]: ` + message + "\n")
      })
    }
  }

  /**
   * Write to file with no level associated.
   * @param {...(string | Uint8Array)} messages
   */
  write (...messages) {
    [...messages].forEach((message) => {
      fs.appendFileSync(this.file, message)
    })
    fs.appendFileSync(this.file, "\n")
  }

  /**
   * @param {...(string | Uint8Array)} messages
   */
  debug (...messages) {
    this.#logFor("debug", ...messages)
  }

  /**
   * @param {...(string | Uint8Array)} messages
   */
  info (...messages) {
    this.#logFor("info", ...messages)
  }

  /**
   * @param {...(string | Uint8Array)} messages
   */
  warning (...messages) {
    this.#logFor("warning", ...messages)
  }

  /**
   * @param {...(string | Uint8Array)} messages
   */
  error (...messages) {
    this.#logFor("error", ...messages)
  }

  /**
   * @param {...(string | Uint8Array)} messages
   */
  critical (...messages) {
    this.#logFor("critical", ...messages)
  }
}
