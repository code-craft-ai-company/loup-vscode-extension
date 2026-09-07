import * as vscode from 'vscode';
import * as path from 'path';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { PortalBreakpointsProvider, PortalBreakpointItem } from './portalBreakpoints.js';
import { TimeTravelManager } from './timeTravelManager.js';
import { TimelinePanel } from './timelinePanel.js';
import { TaskGroupPanel } from './taskGroupPanel.js';
import { LoupTaskProvider } from './taskProvider.js';
import { DependencyTreeProvider } from './dependencyTree.js';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Loup Language extension is now active.');

  // ---- Status bar ----
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(symbol-event) Loup';
  statusBarItem.tooltip = 'Loup Language v0.4';
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.languageId === 'loup' || editor.document.languageId === 'loup-pkg')) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar)
  );
  updateStatusBar();

  // ---- Language Server Client ----
  const serverModule = context.asAbsolutePath(
    path.join('..', 'language-server', 'out', 'server.js')
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
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
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.loup'),
    },
  };

  client = new LanguageClient(
    'loupLanguageServer',
    'Loup Language Server',
    serverOptions,
    clientOptions
  );

  client.start();
  context.subscriptions.push({
    dispose: () => {
      if (client) {
        client.stop();
      }
    },
  });

  // ---- Debug Adapter ----
  const debugAdapterPath = context.asAbsolutePath(
    path.join('..', 'debug-adapter', 'out', 'debugAdapter.js')
  );

  const factory = new DebugAdapterExecutableFactory(debugAdapterPath);
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory('loup', factory)
  );

  // ---- Portal Breakpoints ----
  const portalProvider = new PortalBreakpointsProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loupPortalBreakpoints', portalProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('loup.togglePortalBreakpoint', (item: PortalBreakpointItem) => {
      const nowEnabled = portalProvider.togglePortal(item.name);
      vscode.window.showInformationMessage(
        `Portal "${item.name}" ${nowEnabled ? 'activated' : 'deactivated'}`
      );
    }),
    vscode.commands.registerCommand('loup.addPortalBreakpoint', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter portal name',
        placeHolder: 'e.g. request_start',
      });
      if (name) {
        portalProvider.addPortal(name);
        vscode.window.showInformationMessage(`Portal breakpoint "${name}" added`);
      }
    }),
    vscode.commands.registerCommand('loup.removePortalBreakpoint', (item: PortalBreakpointItem) => {
      portalProvider.removePortal(item.name);
    }),
    vscode.commands.registerCommand('loup.clearPortalBreakpoints', () => {
      portalProvider.clear();
    })
  );

  // ---- Time-Travel ----
  const timeTravel = new TimeTravelManager();

  context.subscriptions.push(
    vscode.commands.registerCommand('loup.startCapture', () => {
      const session = timeTravel.startCapture();
      vscode.window.showInformationMessage(`Time-travel capture started (${session.id})`);
      statusBarItem.text = '$(record) Loup (Recording)';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }),
    vscode.commands.registerCommand('loup.stopCapture', () => {
      const session = timeTravel.stopCapture();
      if (session) {
        vscode.window.showInformationMessage(
          `Capture stopped: ${session.events.length} events recorded`
        );
        statusBarItem.text = '$(symbol-event) Loup';
        statusBarItem.backgroundColor = undefined;

        // Show in timeline
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      }
    }),
    vscode.commands.registerCommand('loup.showTimeline', () => {
      const session = timeTravel.getActiveSession() || timeTravel.getAllSessions()[0];
      if (session) {
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      } else {
        vscode.window.showInformationMessage(
          'No trace session available. Start a capture or open a .loup-trace file.'
        );
      }
    }),
    vscode.commands.registerCommand('loup.openTraceFile', async () => {
      const files = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { 'Loup Trace': ['loup-trace', 'json'] },
      });
      if (files && files[0]) {
        const session = await timeTravel.loadTraceFile(files[0].fsPath);
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
        vscode.window.showInformationMessage(
          `Loaded ${session.events.length} events from trace`
        );
      }
    }),
    vscode.commands.registerCommand('loup.saveTrace', async () => {
      const sessions = timeTravel.getAllSessions();
      if (sessions.length === 0) {
        vscode.window.showWarningMessage('No capture session to save.');
        return;
      }
      const session = sessions[sessions.length - 1];
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(`${session.id}.loup-trace`),
        filters: { 'Loup Trace': ['loup-trace'] },
      });
      if (uri) {
        await timeTravel.saveTraceFile(session.id, uri.fsPath);
        vscode.window.showInformationMessage(`Trace saved to ${uri.fsPath}`);
      }
    }),
    vscode.commands.registerCommand('loup.navigateToEvent', (index: number) => {
      const sessions = timeTravel.getAllSessions();
      const session = sessions[sessions.length - 1];
      if (!session) return;
      const event = timeTravel.getEventAtIndex(session.id, index);
      if (event && event.source) {
        const uri = vscode.Uri.file(event.source);
        vscode.window.showTextDocument(uri, {
          selection: new vscode.Range(
            event.line - 1,
            (event.column || 1) - 1,
            event.line - 1,
            (event.column || 1) - 1
          ),
        });
      }
    }),
    vscode.commands.registerCommand('loup.showTaskGroups', () => {
      TaskGroupPanel.createOrShow();
    })
  );

  // ---- Task Provider ----
  const taskProvider = new LoupTaskProvider();
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(LoupTaskProvider.type, taskProvider)
  );

  // ---- Dependency Tree ----
  const depTree = new DependencyTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loupDependencies', depTree)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('loup.refreshDependencies', () => depTree.refresh())
  );

  // ---- REPL Terminal ----
  context.subscriptions.push(
    vscode.commands.registerCommand('loup.openRepl', () => {
      const terminal = vscode.window.createTerminal({
        name: 'Loup REPL',
        shellPath: 'loup',
        shellArgs: ['repl'],
        iconPath: new vscode.ThemeIcon('terminal'),
      });
      terminal.show();
    })
  );
}

class DebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {
  constructor(private adapterPath: string) {}

  createDebugAdapterDescriptor(
    _session: vscode.DebugSession,
    _executable: vscode.DebugAdapterExecutable | undefined
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    return new vscode.DebugAdapterExecutable('node', [this.adapterPath]);
  }
}

export function deactivate(): Promise<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
