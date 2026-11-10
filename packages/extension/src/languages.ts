// The language ids the extension contributes. Loup's five source extensions
// are one language with one grammar; each has its own id only so that each can
// carry its own file icon (VS Code assigns file icons per language id).

/** Language ids of Loup source files, in the order of §1-13.0.0. */
export const LOUP_SOURCE_LANGUAGES = ['loup', 'loup-script', 'loup-freestanding', 'loup-web', 'loup-native'] as const;

/** Language id of a package manifest (`.lppkg`, `loup.pkg`). */
export const LOUP_MANIFEST_LANGUAGE = 'loup-pkg';

export function isLoupSource(languageId: string): boolean {
  return (LOUP_SOURCE_LANGUAGES as readonly string[]).includes(languageId);
}
