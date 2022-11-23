const SCRIPT_LOAD_DEFAULT_TIMEOUT = 120000

// Keep a dictionary of promises to avoid loading the same script twice.
const promisesBySource = {}

/**
 * Please, only use this as a last resort.
 *
 * Instead prefer, in order:
 * 1. Import dependencies as NPM packages
 * 2. If not available, maintain a copy of the dependency code in our codebase,
 *    in a `vendors` directory.
 *
 * @param {string} src
 * @param {Object} [options]
 * @param {Document} [options.document]
 * @param {number} [options.timeout]
 * @returns {Promise<HTMLScriptElement>}
 */
const dangerouslyInjectScript = (
  src,
  { document = window?.document, timeout = SCRIPT_LOAD_DEFAULT_TIMEOUT } = {},
) =>
  new Promise((resolve, reject) => {
    if (process.server) {
      reject(new Error(`Attempted to load a script on the server: ${src}`))
    }

    let script
    let timeoutId

    const cleanup = () => {
      // Prevent memory leaks on old browsers
      if (script) {
        script.onerror = null
        script.onload = null
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    const handleError = error => {
      cleanup()

      // Only leave the script element on success, so browser can abort loading
      // on timeout + we can safely check if it exists on next attempt.
      if (script) {
        document.body.removeChild(script)
      }

      reject(
        typeof error === 'string'
          ? new Error(`Failed to load ${src} (${error})`)
          : error,
      )
    }

    const handleSuccess = () => {
      cleanup()
      resolve(script)
    }

    try {
      timeoutId = setTimeout(
        () => handleError(`timeout after ${timeout / 1000} seconds.`),
        timeout,
      )

      script = document.createElement('script')
      script.async = true
      script.onload = handleSuccess
      script.onerror = event => handleError(event.type)
      script.src = src
      document.body.appendChild(script)
    } catch (error) {
      handleError(error)
    }
  })

/**
 * @param {string} src
 * @param {Object} [options] See dangerouslyInjectScript
 * @returns {Promise<HTMLScriptElement>}
 */
export function dangerouslyInjectScriptOnce(src, options) {
  if (!promisesBySource[src]) {
    promisesBySource[src] = dangerouslyInjectScript(src, options)
  }

  return promisesBySource[src]
}
