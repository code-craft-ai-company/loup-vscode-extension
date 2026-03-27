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
import { LoomTaskProvider } from './taskProvider.js';
import { DependencyTreeProvider } from './dependencyTree.js';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Loom Language extension is now active.');

  // ---- Status bar ----
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(symbol-event) Loom';
  statusBarItem.tooltip = 'Loom Language v0.4';
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && (editor.document.languageId === 'loom' || editor.document.languageId === 'loom-pkg')) {
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
      { scheme: 'file', language: 'loom' },
      { scheme: 'file', language: 'loom-pkg' },
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.loom'),
    },
  };

  client = new LanguageClient(
    'loomLanguageServer',
    'Loom Language Server',
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
    vscode.debug.registerDebugAdapterDescriptorFactory('loom', factory)
  );

  // ---- Portal Breakpoints ----
  const portalProvider = new PortalBreakpointsProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loomPortalBreakpoints', portalProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('loom.togglePortalBreakpoint', (item: PortalBreakpointItem) => {
      const nowEnabled = portalProvider.togglePortal(item.name);
      vscode.window.showInformationMessage(
        `Portal "${item.name}" ${nowEnabled ? 'activated' : 'deactivated'}`
      );
    }),
    vscode.commands.registerCommand('loom.addPortalBreakpoint', async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter portal name',
        placeHolder: 'e.g. request_start',
      });
      if (name) {
        portalProvider.addPortal(name);
        vscode.window.showInformationMessage(`Portal breakpoint "${name}" added`);
      }
    }),
    vscode.commands.registerCommand('loom.removePortalBreakpoint', (item: PortalBreakpointItem) => {
      portalProvider.removePortal(item.name);
    }),
    vscode.commands.registerCommand('loom.clearPortalBreakpoints', () => {
      portalProvider.clear();
    })
  );

  // ---- Time-Travel ----
  const timeTravel = new TimeTravelManager();

  context.subscriptions.push(
    vscode.commands.registerCommand('loom.startCapture', () => {
      const session = timeTravel.startCapture();
      vscode.window.showInformationMessage(`Time-travel capture started (${session.id})`);
      statusBarItem.text = '$(record) Loom (Recording)';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }),
    vscode.commands.registerCommand('loom.stopCapture', () => {
      const session = timeTravel.stopCapture();
      if (session) {
        vscode.window.showInformationMessage(
          `Capture stopped: ${session.events.length} events recorded`
        );
        statusBarItem.text = '$(symbol-event) Loom';
        statusBarItem.backgroundColor = undefined;

        // Show in timeline
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      }
    }),
    vscode.commands.registerCommand('loom.showTimeline', () => {
      const session = timeTravel.getActiveSession() || timeTravel.getAllSessions()[0];
      if (session) {
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      } else {
        vscode.window.showInformationMessage(
          'No trace session available. Start a capture or open a .loom-trace file.'
        );
      }
    }),
    vscode.commands.registerCommand('loom.openTraceFile', async () => {
      const files = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { 'Loom Trace': ['loom-trace', 'json'] },
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
    vscode.commands.registerCommand('loom.saveTrace', async () => {
      const sessions = timeTravel.getAllSessions();
      if (sessions.length === 0) {
        vscode.window.showWarningMessage('No capture session to save.');
        return;
      }
      const session = sessions[sessions.length - 1];
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(`${session.id}.loom-trace`),
        filters: { 'Loom Trace': ['loom-trace'] },
      });
      if (uri) {
        await timeTravel.saveTraceFile(session.id, uri.fsPath);
        vscode.window.showInformationMessage(`Trace saved to ${uri.fsPath}`);
      }
    }),
    vscode.commands.registerCommand('loom.navigateToEvent', (index: number) => {
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
    vscode.commands.registerCommand('loom.showTaskGroups', () => {
      TaskGroupPanel.createOrShow();
    })
  );

  // ---- Task Provider ----
  const taskProvider = new LoomTaskProvider();
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(LoomTaskProvider.type, taskProvider)
  );

  // ---- Dependency Tree ----
  const depTree = new DependencyTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loomDependencies', depTree)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('loom.refreshDependencies', () => depTree.refresh())
  );

  // ---- REPL Terminal ----
  context.subscriptions.push(
    vscode.commands.registerCommand('loom.openRepl', () => {
      const terminal = vscode.window.createTerminal({
        name: 'Loom REPL',
        shellPath: 'loom',
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
