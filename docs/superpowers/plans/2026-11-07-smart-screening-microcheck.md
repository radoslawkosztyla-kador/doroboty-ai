# Mikro-Pytanie Pułapkowe (Smart Screening & Proof of Thinking) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wdrożenie do aplikacji DoRoboty.ai mechanizmu Mikro-Pytania Pułapkowego (Smart Screening 60s) w natywnym, istniejącym interfejsie aplikacji (bez wprowadzania nowego design systemu Lego Technic), skupiając się wyłącznie na logice funkcjonalnej i weryfikacji kandydatów.

**Architecture:** Rozszerzenie modeli domeny Zod o opcjonalne pola pytania (`screeningQuestion`) i odpowiedzi (`screeningAnswer`, `screeningTimeSeconds`), dodanie modułu pytania ze switchem w edytorze ogłoszeń (`employer.tsx`), zablokowanie wklejania ze schowka w formularzu aplikacji (`workspace.tsx`), oraz wyeksponowanie karty odpowiedzi kandydata z informacją o weryfikacji w panelu rekrutera (`recruiting-application.tsx` i `application-record.tsx`) z wykorzystaniem istniejących komponentów Base UI i stylów aplikacji.

**Tech Stack:** React 19, TypeScript, Zod, Vite, Base UI / CSS aplikacji, Vitest.

**Spec:** Istniejący interfejs `doroboty-ai-app` (`GUI.md`), decyzja Supersprintu (`decision.md`).

## Global Constraints

- Pracujemy wyłącznie na **istniejących stylach i komponentach aplikacji** (`components/ui/*`, `workspace.css`, `records.css`). **Nie wprowadzamy stylistyki Lego Technic ani nowych tokenów wizualnych.**
- Wszystkie nowe pola w Zod (`model.ts`) muszą być `.optional()`, aby zachować 100% kompatybilności wstecznej z danymi w `marketplace.json` i istniejącymi testami.
- Wklejanie ze schowka w polu mikro-odpowiedzi kandydata musi być technicznie zablokowane (`onPaste={(e) => e.preventDefault()}`), aby wymusić samodzielną odpowiedź.
- Wszystkie istniejące testy (`npm test`) oraz build (`npm run build`) muszą przechodzić na zielono po każdym zadaniu.

## Review Focus

- Próba wysłania pustej odpowiedzi na pytanie pułapkowe (gdy jest aktywne w ofercie) blokuje submit formularza z czytelnym komunikatem walidacji.
- Oferty bez pytania pułapkowego zachowują w 100% dotychczasowy flow i wyświetlają tradycyjny `MatchScore`.
- Edycja istniejącego ogłoszenia zachowuje wcześniej wybrane pytanie pułapkowe i stan switcha.
- Zdarzenie wklejania (`paste`) w polu kandydata jest ignorowane i nie pozwala na wklejenie wygenerowanego tekstu z asystenta AI.
- Akcje zmiany statusu kandydata w panelu rekrutera (zaproszenie na 1. rozmowę, odrzucenie) działają poprawnie.

---

### Task 1: Rozszerzenie Schematów Zod i Modelu Danych (Wstecznie Kompatybilne)

**Files:**

- Modify: `3-Projects/doroboty-ai-app/src/features/prototype/model.ts`
- Test: `3-Projects/doroboty-ai-app/src/features/prototype/model.test.ts`

**Interfaces:**

- Produces: `jobSchema` z polami `screeningQuestion: text.optional()` i `screeningEnabled: z.boolean().optional()`.
- Produces: `applicationSchema` z polami `screeningAnswer: text.optional()`, `screeningTimeSeconds: z.number().int().optional()`.
- Produces: akcja `submit` w `run()` obsługująca `screeningAnswer` i `screeningTimeSeconds`.

- [ ] **Step 1: Napisz test jednostkowy weryfikujący nowe pola w `model.test.ts`**
      Dopisz test sprawdzający, czy oferta z `screeningQuestion` poprawnie przechodzi walidację Zod, a aplikacja z `screeningAnswer` i `screeningTimeSeconds` zapisuje się w stanie. Upewnij się, że stara oferta bez tych pól nadal parsuje się bez błędu.

- [ ] **Step 2: Uruchom test, aby upewnić się, że nie przechodzi (RED)**
      Run: `npm --prefix 3-Projects/doroboty-ai-app test src/features/prototype/model.test.ts`
      Expected: FAIL (brak pól w schematach i akcji).

- [ ] **Step 3: Zaimplementuj rozszerzenie schematów w `model.ts`**
      Dodaj opcjonalne pola w `jobSchema`, `applicationSchema`, typie akcji `submit` i w reducerze obsługującym zapis aplikacji.

- [ ] **Step 4: Uruchom testy i upewnij się, że przechodzą (GREEN)**
      Run: `npm --prefix 3-Projects/doroboty-ai-app test src/features/prototype/model.test.ts`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C 3-Projects/doroboty-ai-app add src/features/prototype/model.ts src/features/prototype/model.test.ts
git -C 3-Projects/doroboty-ai-app commit -m "feat(model): add optional screening question and answer fields to Zod schemas"
```

---

### Task 2: Moduł Mikro-Pytania w Kreatorze Ogłoszenia Pracodawcy (Natywne UI)

**Files:**

- Modify: `3-Projects/doroboty-ai-app/src/features/prototype/employer.tsx`

**Interfaces:**

- Consumes: `jobSchema.screeningQuestion`, `jobSchema.screeningEnabled` z Task 1.
- Produces: Widok kreatora ogłoszenia z komponentem wyboru pytania kontrolnego w spójnym, istniejącym stylu formularzy aplikacji.

- [ ] **Step 1: Zdefiniuj szablony pytań pod role w `employer.tsx`**
      Przygotuj 3 gotowe szablony pytań do wyboru:
- _Dla BUILD (RAG / AI Engineer):_ „Nasz agent RAG przy 50 dokumentach myli daty. Co sprawdzisz najpierw w pipeline i dlaczego?”
- _Dla APPLY (Automatyzacje / Workflow):_ „Pokaż, w którym miejscu wygenerowany kod agenta wpadnie w pętlę przy błędzie 429 i jak to zabezpieczysz.”
- _Dla LEAD (Product / Architecture):_ „Zarząd chce zastąpić programistów autonomicznymi agentami. W 2–3 zdaniach: gdzie model agentowy zawodzi bez Product Engineera?”
  Oraz opcję wpisania pytania własnego.

- [ ] **Step 2: Zaimplementuj pole wyboru pytania w `EmployerJobEditor`**
      W istniejącym formularzu edytora dodaj checkbox/switch aktywujący pytanie pułapkowe oraz listę opcji wyboru szablonu w obecnych stylach formularza (`prototype-panel`, standardowy `Checkbox` i `Textarea`).

- [ ] **Step 3: Zweryfikuj kompilację TypeScript**
      Run: `npm --prefix 3-Projects/doroboty-ai-app run build`
      Expected: PASS

- [ ] **Step 4: Commit**

```bash
git -C 3-Projects/doroboty-ai-app add src/features/prototype/employer.tsx
git -C 3-Projects/doroboty-ai-app commit -m "feat(employer): add screening question selector to job editor"
```

---

### Task 3: Informacja o Mikro-Check na Karcie Oferty i Liście Ofert (Natywne UI)

**Files:**

- Modify: `3-Projects/doroboty-ai-app/src/features/jobs/job-card.tsx`

**Interfaces:**

- Consumes: `job.screeningEnabled`, `job.screeningQuestion`.
- Produces: Subtelna odznaka / informacja przy ofercie w istniejącej stylistyce kart pracy.

- [ ] **Step 1: Dodaj znacznik informacyjny na karcie oferty**
      W `job-card.tsx`, jeśli oferta ma `screeningEnabled`, dodaj czytelną etykietę w istniejącym stylu tagów oferty: `Mikro-Check (60s) — weryfikacja bez AI-slopu`.

- [ ] **Step 2: Sprawdź testy jednostkowe ofert i filtrów**
      Run: `npm --prefix 3-Projects/doroboty-ai-app test src/features/jobs/`
      Expected: PASS

- [ ] **Step 3: Commit**

```bash
git -C 3-Projects/doroboty-ai-app add src/features/jobs/job-card.tsx
git -C 3-Projects/doroboty-ai-app commit -m "feat(jobs): display screening badge on job cards with active question"
```

---

### Task 4: Formularz Aplikowania z Blokadą Wklejania i Stoperem (Zero Friction)

**Files:**

- Modify: `3-Projects/doroboty-ai-app/src/features/prototype/workspace.tsx`

**Interfaces:**

- Consumes: `job.screeningQuestion`, `job.screeningEnabled`.
- Produces: Obsługa wpisywania `screeningAnswer`, stoper czasu `screeningTimeSeconds`, blokada zdarzenia `paste`.

- [ ] **Step 1: Dodaj sekcję Pytania Pułapkowego w `ApplyPage` (`workspace.tsx`)**
      Jeśli oferta ma aktywne `screeningQuestion`, wyświetl treść pytania z jasnym komunikatem: _„Odpowiedz krótko z własnego doświadczenia (2–3 zdania). Wklejanie ze schowka jest wyłączone.”_.

- [ ] **Step 2: Zaimplementuj blokadę wklejania i pomiar czasu**
      W polu `Textarea` zablokuj zdarzenie `onPaste={(e) => { e.preventDefault(); setError("Wklejanie ze schowka jest zablokowane. Wpisz odpowiedź z głowy!"); }}`. Mierz czas w sekundach od wejścia na stronę do wysłania formularza.

- [ ] **Step 3: Zaktualizuj submit aplikacji**
      W akcji `run({ type: "submit", ... })` przekaż zebraną odpowiedź `screeningAnswer` oraz `screeningTimeSeconds`.

- [ ] **Step 4: Uruchom build i testy**
      Run: `npm --prefix 3-Projects/doroboty-ai-app run build`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C 3-Projects/doroboty-ai-app add src/features/prototype/workspace.tsx
git -C 3-Projects/doroboty-ai-app commit -m "feat(apply): add screening question field with paste prevention and timer"
```

---

### Task 5: Karta Odpowiedzi Kandydata w Panelu Rekrutera (Zastąpienie Match Score)

**Files:**

- Modify: `3-Projects/doroboty-ai-app/src/features/prototype/recruiting-application.tsx`
- Modify: `3-Projects/doroboty-ai-app/src/features/prototype/application-record.tsx`

**Interfaces:**

- Consumes: `application.screeningAnswer`, `application.screeningTimeSeconds`.
- Produces: Prezentacja odpowiedzi kandydata na samej górze profilu zamiast procentowego `MatchScore` (dla aplikacji z pytaniem kontrolnym).

- [ ] **Step 1: Dodaj panel odpowiedzi kandydata w `recruiting-application.tsx`**
      Jeśli aplikacja posiada `screeningAnswer`, wyświetl wyróżniony panel z treścią odpowiedzi, zadanym pytaniem oraz informacją: _„Odpowiedź wpisana ręcznie w X sekund (wklejanie zablokowane)”_.

- [ ] **Step 2: Warunkowe zastąpienie Match Score**
      Dla aplikacji z `screeningAnswer` zastąp widget `MatchScore` czytelną odznaką _„Zweryfikowano z pytaniem kontrolnym”_. Dla pozostałych aplikacji zachowaj dotychczasowy `MatchScore`.

- [ ] **Step 3: Uruchom pełną weryfikację aplikacji (`npm test && npm run build`)**
      Run: `npm --prefix 3-Projects/doroboty-ai-app test && npm --prefix 3-Projects/doroboty-ai-app run build`
      Expected: Wszystkie testy na zielono, zero błędów TypeScript i kompilacji.

- [ ] **Step 4: Commit**

```bash
git -C 3-Projects/doroboty-ai-app add src/features/prototype/recruiting-application.tsx src/features/prototype/application-record.tsx
git -C 3-Projects/doroboty-ai-app commit -m "feat(recruiting): show candidate screening answer and replace match score"
```
