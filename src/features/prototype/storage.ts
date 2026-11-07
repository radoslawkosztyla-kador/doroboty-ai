import { initialState, stateSchema, type State } from "./model";
export const STORAGE_KEY = "doroboty.prototype.v1";
export const MAX_IMPORT_BYTES = 2_000_000;
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function parseState(raw: string): State {
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    throw new Error("Plik jest za duży (maksymalnie 2 MB).");
  try {
    const parsed = stateSchema.parse(JSON.parse(raw));
    const firstJob = parsed.jobs[0];
    if (firstJob && firstJob.screeningEnabled === undefined) {
      firstJob.screeningEnabled = true;
      firstJob.screeningQuestion =
        "Nasz agent RAG przy 50 dokumentach gubi precyzję cytowania dat w tabelach. W 2–3 zdaniach: co sprawdzisz najpierw w pipeline i dlaczego?";
    }
    const exampleApp = parsed.applications.find((a) => a.id === "application-example");
    if (exampleApp && exampleApp.screeningAnswer === undefined) {
      exampleApp.screeningAnswer =
        "Sprawdzam strategię chunkingu — przy sztywnym podziale co 500 tokenów daty z nagłówków odrywają się od wierszy tabeli. Wdrażam Parent-Document Retriever oraz ekstrakcję metadanych daty przed embeddingiem.";
      exampleApp.screeningTimeSeconds = 72;
    }
    return parsed;
  } catch {
    throw new Error(
      "Nieprawidłowy plik lub nieobsługiwana wersja danych. Dotychczasowy stan pozostaje bez zmian.",
    );
  }
}
export function serializeState(state: State) {
  return JSON.stringify(state, null, 2);
}
export function readState(storage: StoragePort | null) {
  if (!storage)
    return {
      state: initialState(),
      issue:
        "Zapis w przeglądarce jest niedostępny. Zmiany zachowasz przez eksport w ustawieniach.",
      blocked: false,
      original: null,
    };
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    return {
      state: raw ? parseState(raw) : initialState(),
      issue: "",
      blocked: false,
      original: null,
    };
  } catch {
    return {
      state: initialState(),
      issue:
        "Nie udało się odczytać zapisu. Dotychczasowe dane nie zostaną nadpisane. Pobierz je w ustawieniach, a następnie zaimportuj poprawny plik lub zresetuj scenariusz.",
      blocked: true,
      original: raw,
    };
  }
}
export function saveState(storage: StoragePort | null, state: State) {
  if (!storage)
    throw new Error(
      "Zapis w przeglądarce jest niedostępny. Wyeksportuj zmiany przed zamknięciem strony.",
    );
  const raw = serializeState(state);
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    throw new Error("Dane przekraczają 2 MB. Wyeksportuj je, aby zachować zmiany.");
  try {
    storage.setItem(STORAGE_KEY, raw);
  } catch {
    throw new Error(
      "Nie udało się zapisać zmian w przeglądarce. Wyeksportuj dane przed zamknięciem strony.",
    );
  }
}
