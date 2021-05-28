// Reference
// https://code.visualstudio.com/api/extension-guides/webview

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

class WebPanel {
  public static currentPanel: WebPanel | undefined;
  private static readonly viewType = 'angular';
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionPath: string;
  private readonly builtAppFolder: string;
  private disposables: vscode.Disposable[] = [];
  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    // Otherwise, create angular panel.
    if (WebPanel.currentPanel) {
      WebPanel.currentPanel.panel.reveal(column);
    } else {
      WebPanel.currentPanel = new WebPanel(extensionPath, column || vscode.ViewColumn.One);
    }
    return WebPanel.currentPanel;
  }

  private constructor(extensionPath: string, column: vscode.ViewColumn) {
    this.extensionPath = extensionPath;
    this.builtAppFolder = 'prod/cicd';

    // Create and show a new webview panel
    this.panel = vscode.window.createWebviewPanel(WebPanel.viewType, 'Angular Studio: DevOps', column, {
      // Enable javascript in the webview
      enableScripts: true,
      retainContextWhenHidden: true,
      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, this.builtAppFolder))]
    });

    // Set the webview's initial html content
    this.panel.webview.html = this.getHtmlForWebview();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this.disposables
    );
  }

  public dispose() {
    WebPanel.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  /**
   * Returns html of the start page (index.html)
   */
  private getHtmlForWebview() {
    // path to dist folder
    const appDistPath = path.join(this.extensionPath, 'prod/cicd');
    const appDistPathUri = vscode.Uri.file(appDistPath);
    // path as uri
    const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);
    // get path to index.html file from dist folder
    const indexPath = path.join(appDistPath, 'index.html');
    // read index file from file system
    let indexHtml = fs.readFileSync(indexPath, { encoding: 'utf8' });
    // update the base URI tag
    indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
    return indexHtml;
  }
}

/**
 * Activates extension
 * @param context vscode extension context
 */

export function activate(context: vscode.ExtensionContext) {
  // TODO remove this later after we figure out how to start with a button on the side panel
  setTimeout(() => {
    WebPanel.createOrShow(context.extensionPath);
  }, 1000);

  context.subscriptions.push(
    vscode.commands.registerCommand('open-devops-panel', () => {
      WebPanel.createOrShow(context.extensionPath);
    })
  );
}

