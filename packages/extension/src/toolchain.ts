import * as vscode from 'vscode';

/** The `loup` executable: the `loup.executable` setting, else `$LOUP_PATH`, else `loup` on `PATH`. */
export function loupExecutable(): string {
  const set = vscode.workspace.getConfiguration('loup').get<string>('executable', '').trim();
  return set || process.env['LOUP_PATH'] || 'loup';
}
