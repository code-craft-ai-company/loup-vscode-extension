// ============================================================================
// Loup Language Extension for Visual Studio Code
// Entry point — P0–P5: Grammar, LSP, DAP, Portals, Time-Travel, Tasks, Deps
// ============================================================================

import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

import {
  PortalBreakpointManager,
  PortalBreakpointsTreeProvider,
  PortalCodeLensProvider,
  PortalBreakpointItem,
} from './portalBreakpoints';
import { TimeTravelManager } from './timeTravelManager';
import { TimelinePanel } from './timelinePanel';
import { TaskGroupPanel } from './taskGroupPanel';
import { LoupTaskProvider } from './taskProvider';
import { DependencyTreeProvider } from './dependencyTree';

let client: LanguageClient | undefined;
let portalManager: PortalBreakpointManager;
let timeTravelManager: TimeTravelManager;
let timelinePanel: TimelinePanel;
let taskGroupPanel: TaskGroupPanel;
let depTreeProvider: DependencyTreeProvider;

const EXTENSION_MODE_INFO: Record<string, { label: string; defaultMode: string; description: string }> = {
  '.loup': {
    label: 'Loup',
    defaultMode: 'host.scripted',
    description: 'General Loup source file (any execution mode)',
  },
  '.lpscr': {
    label: 'Loup (host-script)',
    defaultMode: 'host.scripted',
    description: 'Host-script or dual-mode Loup source (.lpscr — host.scripted / host.dual)',
  },
  '.lpfree': {
    label: 'Loup (freestanding)',
    defaultMode: 'freestanding',
    description: 'Freestanding bare-metal Loup source (.lpfree — @mode(freestanding))',
  },
  '.lpweb': {
    label: 'Loup (web)',
    defaultMode: 'web.scripted',
    description: 'Web-hosted Loup source (.lpweb — web.scripted / web.compiled)',
  },
  '.lphc': {
    label: 'Loup (host-compiled)',
    defaultMode: 'host.native',
    description: 'Host-compiled native Loup source (.lphc — host.native / host.dual)',
  },
};

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel('Loup Language');
  outputChannel.appendLine('Loup Language extension v1.20.0 activated.');

  // ---- Status bar item ----
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(symbol-misc) Loup';
  statusBarItem.tooltip = 'Loup Language v1.20';
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = (editor: vscode.TextEditor | undefined) => {
    if (
      editor &&
      (editor.document.languageId === 'loup' ||
        editor.document.languageId === 'loup-pkg')
    ) {
      if (editor.document.languageId === 'loup-pkg') {
        statusBarItem.text = '$(package) Loup Manifest';
        statusBarItem.tooltip = 'Loup Package Manifest (.lppkg) — v1.20';
      } else {
        const ext = path.extname(editor.document.fileName).toLowerCase();
        const extInfo = EXTENSION_MODE_INFO[ext] ?? EXTENSION_MODE_INFO['.loup'];
        const firstLines = editor.document.getText(new vscode.Range(0, 0, 20, 0));
        const modeMatch = firstLines.match(/@mode\(\s*([a-zA-Z0-9_.]+)\s*\)/);
        const activeMode = modeMatch ? modeMatch[1] : extInfo.defaultMode;
        statusBarItem.text = `$(symbol-misc) Loup [${activeMode}]`;
        statusBarItem.tooltip = `${extInfo.description}\nActive mode: @mode(${activeMode})`;
      }
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (vscode.window.activeTextEditor?.document === e.document) {
        updateStatusBar(vscode.window.activeTextEditor);
      }
    })
  );
  updateStatusBar(vscode.window.activeTextEditor);

  // ---- Start LSP client ----
  startLanguageClient(context, outputChannel);

  // ---- Register debug configuration provider ----
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider('loup', new LoupDebugConfigurationProvider())
  );

  // ---- P3: Portal Breakpoints ----
  portalManager = new PortalBreakpointManager(context);
  const portalTreeProvider = new PortalBreakpointsTreeProvider(portalManager);
  const portalCodeLens = new PortalCodeLensProvider(portalManager);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loupPortalBreakpoints', portalTreeProvider),
    vscode.languages.registerCodeLensProvider({ language: 'loup' }, portalCodeLens)
  );

  // Portal commands
  context.subscriptions.push(
    vscode.commands.registerCommand('loup.portal.toggle', (name: string) => {
      portalManager.toggle(name);
    }),
    vscode.commands.registerCommand('loup.portal.add', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter portal name to break on',
        placeHolder: 'e.g., request_start or checkout.enter',
      });
      if (!name) return;

      const condition = await vscode.window.showInputBox({
        prompt: 'Optional condition expression (leave empty for unconditional)',
        placeHolder: 'e.g., user.id == 42',
      });

      const oncePick = await vscode.window.showQuickPick(['Every time', 'Once only'], {
        placeHolder: 'Break every time or only once?',
      });

      portalManager.add(name, condition || undefined, oncePick === 'Once only');
    }),
    vscode.commands.registerCommand('loup.portal.remove', (item: PortalBreakpointItem) => {
      if (item?.portal?.name) {
        portalManager.remove(item.portal.name);
      }
    }),
    vscode.commands.registerCommand('loup.portal.clearAll', () => {
      portalManager.clear();
    })
  );

  // ---- P3: Time-Travel Debugging ----
  timeTravelManager = new TimeTravelManager();
  timelinePanel = new TimelinePanel(context, timeTravelManager);

  context.subscriptions.push(
    vscode.commands.registerCommand('loup.timeTravel.start', () => {
      timeTravelManager.startCapture();
      vscode.window.showInformationMessage('Time-travel capture started.');
    }),
    vscode.commands.registerCommand('loup.timeTravel.stop', () => {
      timeTravelManager.stopCapture();
      vscode.window.showInformationMessage(
        `Time-travel capture stopped. ${timeTravelManager.getEvents().length} events recorded.`
      );
    }),
    vscode.commands.registerCommand('loup.timeTravel.showTimeline', () => {
      timelinePanel.show();
    }),
    vscode.commands.registerCommand('loup.timeTravel.openTrace', async () => {
      const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'Loup Trace': ['loup-trace', 'json'] },
        openLabel: 'Open Trace Recording',
      });
      if (uris && uris[0]) {
        try {
          await timeTravelManager.loadRecording(uris[0]);
          timelinePanel.show();
          vscode.window.showInformationMessage('Trace recording loaded.');
        } catch (err) {
          vscode.window.showErrorMessage(`Failed to load trace: ${err}`);
        }
      }
    }),
    vscode.commands.registerCommand('loup.timeTravel.saveTrace', async () => {
      const uri = await vscode.window.showSaveDialog({
        filters: { 'Loup Trace': ['loup-trace', 'json'] },
        saveLabel: 'Save Trace Recording',
      });
      if (uri) {
        await timeTravelManager.saveRecording(uri);
        vscode.window.showInformationMessage('Trace recording saved.');
      }
    }),
    vscode.commands.registerCommand('loup.timeTravel.navigateTo', async (seq: number) => {
      const event = timeTravelManager.stepTo(seq);
      if (event?.source && event.line !== undefined) {
        const doc = await vscode.workspace.openTextDocument(event.source);
        await vscode.window.showTextDocument(doc, {
          selection: new vscode.Range(event.line - 1, 0, event.line - 1, 0),
          preserveFocus: true,
        });
      }
    })
  );

  // ---- P4: Task Group Visualizer ----
  taskGroupPanel = new TaskGroupPanel(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('loup.showTaskGroups', () => {
      taskGroupPanel.show();
    })
  );

  // ---- P5: Toolchain Integration ----
  // Task provider for loup run/build/test/fmt/check
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(LoupTaskProvider.type, new LoupTaskProvider())
  );

  // Dependency tree view
  depTreeProvider = new DependencyTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loupDependencies', depTreeProvider),
    vscode.commands.registerCommand('loup.refreshDependencies', () => {
      depTreeProvider.refresh();
    })
  );

  // REPL terminal profile
  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider('loup.repl', {
      provideTerminalProfile(): vscode.ProviderResult<vscode.TerminalProfile> {
        return new vscode.TerminalProfile({
          name: 'Loup REPL',
          shellPath: process.env['LOUP_PATH'] || 'loup',
          shellArgs: ['repl'],
          iconPath: new vscode.ThemeIcon('terminal'),
        });
      },
    }),
    vscode.commands.registerCommand('loup.openRepl', () => {
      const terminal = vscode.window.createTerminal({
        name: 'Loup REPL',
        shellPath: process.env['LOUP_PATH'] || 'loup',
        shellArgs: ['repl'],
      });
      terminal.show();
    })
  );

  outputChannel.appendLine('All P0–P5 features registered.');
}

// ---- Debug Configuration Provider ----

class LoupDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
  resolveDebugConfiguration(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    _token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'loup') {
        config.type = 'loup';
        config.name = 'Run Loup File';
        config.request = 'launch';
        config.program = '${file}';
        config.target = 'cli';
      }
    }

    if (!config.program) {
      return vscode.window.showInformationMessage('Cannot find a Loup program to debug').then(_ => {
        return undefined;
      });
    }

    // Inject active portal breakpoints into launch config
    if (portalManager) {
      const activePortals = portalManager.getEnabled().map(p => p.name);
      if (activePortals.length > 0 && !config.portalBreakpoints) {
        config.portalBreakpoints = activePortals;
      }
    }

    return config;
  }
}

// ---- Language Client ----

function startLanguageClient(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  const serverModule = context.asAbsolutePath(
    path.join('..', 'language-server', 'out', 'server.js')
  );

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'loup' },
      { scheme: 'file', language: 'loup-pkg' },
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.{loup,lpscr,lpfree,lpweb,lphc,lppkg}'),
    },
    outputChannel,
  };

  client = new LanguageClient(
    'loupLanguageServer',
    'Loup Language Server',
    serverOptions,
    clientOptions
  );

  client.start().then(
    () => {
      outputChannel.appendLine('Loup Language Server started.');
    },
    (err) => {
      outputChannel.appendLine(`Failed to start Language Server: ${err}`);
    }
  );

  context.subscriptions.push({
    dispose: () => {
      if (client) {
        client.stop();
      }
    },
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (client) {
    return client.stop();
  }
  return undefined;
}
