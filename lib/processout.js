import { dangerouslyInjectScriptOnce } from './dom'

export const PROCESSOUT_SDK_URL = 'https://js.processout.com/processout.js'

export async function loadProcessOutLibrary() {
  await dangerouslyInjectScriptOnce(PROCESSOUT_SDK_URL)
  return window.ProcessOut
}
