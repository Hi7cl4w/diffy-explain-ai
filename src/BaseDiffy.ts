import { window } from "vscode";
import { CONSTANTS } from "./Constants";

export default class BaseDiffy {
  constructor() {}

  /**
   * This function shows an error message
   * @param {string} msg - The message to display.
   */
  showErrorMessage(msg: string) {
    window.showErrorMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }

  /**
   * It shows an information message
   * @param {string} msg - The message to show.
   */
  showInformationMessage(msg: string) {
    window.showInformationMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }
}
