# 🚀 GETTING_STARTED — для Олега

Краткий гид как начать работу с Claude Code на проекте Receipto.

---

## 📦 Что у тебя в руках

```
receipto/
├── CLAUDE.md                    ← Главный файл, Claude Code читает первым
├── README.md                    ← Публичное описание проекта
├── GETTING_STARTED.md           ← Этот файл
├── bootstrap.sh                 ← Скрипт инициализации
├── .claude/
│   └── commands/                ← Кастомные slash-команды
│       ├── check.md
│       ├── db.md
│       ├── ship.md
│       ├── legal.md
│       └── new-feature.md
└── docs/
    ├── 01-product.md
    ├── 02-tech-stack.md
    ├── 03-architecture.md
    ├── 04-legal-compliance.md  ← КРИТИЧНО для legal фич
    ├── 05-coding-standards.md
    ├── 06-ai-prompts.md
    ├── 07-roadmap.md
    └── 08-glossary.md
```

---

## ⚡ Быстрый старт (10 минут)

### 1. Установи Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

(Нужен Node.js v20+. Если нет — скачай с nodejs.org)

### 2. Создай папку проекта и распакуй файлы

```bash
mkdir ~/projects/receipto
cd ~/projects/receipto
# Распакуй содержимое архива сюда
```

### 3. Запусти bootstrap

```bash
bash bootstrap.sh
```

Это создаст:
- pnpm + Turborepo monorepo структуру
- `package.json`, `tsconfig.json`, `.gitignore`
- `apps/`, `packages/`, `supabase/` папки
- `.env.example` с шаблоном переменных

### 4. Установи зависимости

```bash
pnpm install
```

### 5. Сделай первый commit

```bash
git add .
git commit -F COMMIT_MESSAGE.txt
rm COMMIT_MESSAGE.txt
```

### 6. Создай приватный GitHub репо

```bash
# Если установлен GitHub CLI:
gh repo create receipto --private --source=. --push

# Или вручную через github.com → New repo → потом:
git remote add origin git@github.com:USERNAME/receipto.git
git push -u origin main
```

### 7. Запусти Claude Code

```bash
claude
```

В первом сообщении напиши:

> *"Прочитай CLAUDE.md и скажи что ты понял про проект. Потом покажи мне docs/07-roadmap.md и предложи с чего начать."*

---

## 🎯 Как правильно работать с Claude Code

### ✅ Что делать каждую сессию

1. **Открыть Claude Code в папке проекта** (`cd ~/projects/receipto && claude`)
2. **Первое сообщение:** напомни ему прочитать `CLAUDE.md` если кажется что забыл
3. **Использовать slash-команды:**
   - `/check` — прогнать lint + typecheck + tests
   - `/db` — обновить Supabase типы
   - `/ship` — preflight перед push
   - `/legal` — загрузить юридический контекст перед работой над письмами
   - `/new-feature <name>` — создать скелет новой фичи
4. **Перед каждым commit** — попросить `/check`
5. **После сессии** — попросить summary что сделано (для commit message)

### ❌ Чего НЕ делать

1. **Не давай Claude Code делать `git push --force` или `rm -rf`** без явного согласия
2. **Не позволяй ему добавлять зависимости без обсуждения** — он уже это знает из CLAUDE.md
3. **Не доверяй слепо юридическим утверждениям** — он будет ссылаться на BGB, но если параграф не в `docs/04-legal-compliance.md` — не верь
4. **Не пиши код в Russian** — даже если Claude Code это сделает, попроси переписать на English
5. **Не ставь "TODO" и забывай** — либо делай, либо документируй явно

---

## 💡 Полезные паттерны промптов

### При начале нового феча:
```
Я хочу добавить [feature]. Прочитай docs/01-product.md и docs/03-architecture.md,
потом предложи план и спроси меня уточняющие вопросы перед написанием кода.
```

### При работе с legal:
```
/legal

Я хочу сделать функцию которая генерирует Widerruf-письмо.
Покажи план какие файлы нужно создать.
```

### Перед commit:
```
/check

Если всё ок — предложи commit message в Conventional Commits формате.
```

### Если Claude Code предлагает что-то странное:
```
Подожди. Это противоречит docs/02-tech-stack.md (или какому подходящему файлу).
Перечитай его и предложи решение в рамках нашего стека.
```

---

## 🔑 Что нужно настроить отдельно (ручная работа)

### Supabase
1. Зайти на supabase.com → New Project
2. **Region: Frankfurt (eu-central-1)** ← КРИТИЧНО для GDPR
3. Скопировать project URL, anon key, service role key в `.env.local`

### Apple Developer (€99/год)
1. developer.apple.com → enroll
2. Нужен будет позже когда соберёшься в App Store
3. Подождать с этим до месяца 3-4

### Google Play (€25 единоразово)
1. play.google.com/console → register
2. Также подождать с этим до месяца 3-4

### Anthropic Claude API
1. console.anthropic.com → API keys
2. Положить €10-20 на старт
3. Ключ → в `.env.local`

### RevenueCat (бесплатно до $10K MRR)
1. revenuecat.com → signup
2. Позже когда будут готовы in-app purchases

### Sentry, PostHog
1. Free tier обоих хватит надолго
2. Сделать когда будет первый launch

---

## 📚 Если что-то непонятно

1. **Сначала проверь docs/** — там обычно есть ответ
2. **Спроси Claude Code** — он знает контекст
3. **Если про юриспруденцию** — Verbraucherzentrale.de или платный консульт у Anwalt'а

---

## 🎬 Твой следующий шаг прямо сейчас

```bash
# 1. Установи Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Создай папку и распакуй файлы
mkdir -p ~/projects/receipto
cd ~/projects/receipto
# (распакуй receipto-claude-code.zip сюда)

# 3. Bootstrap
bash bootstrap.sh
pnpm install

# 4. Запусти Claude Code
claude
```

**Первое сообщение Claude Code:**
> *"Прочитай CLAUDE.md полностью, потом docs/07-roadmap.md. Скажи что ты понял про проект и текущую фазу. Не пиши никакого кода, просто подтверди что ты в контексте."*

Если он ответит правильно — ты готов работать.

Удачи! 🚀
