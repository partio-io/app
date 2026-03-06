# Plan: Render Markdown in Chat Bubbles

## Context

The checkpoint detail page (`/[owner]/[repo]/checkpoints/[checkpointId]`) shows session transcripts in chat bubbles via `TranscriptViewer`. Currently, message content is rendered as plain text with `whitespace-pre-wrap`. Many messages — especially user prompts with plans and assistant responses — contain rich markdown (headings, bold, code blocks, lists, tables) that displays as raw syntax instead of being rendered.

The app already has `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, and `rehype-raw` installed. The `PlanViewer` component on the same page already renders markdown beautifully with custom styled components and syntax highlighting.

## Change

### Single file: `app/src/components/ui/transcript-viewer.tsx`

**1. Add imports** — `ReactMarkdown`, `remarkGfm`, `SyntaxHighlighter`, `oneDark` (same as `plan-viewer.tsx`)

**2. Replace plain-text rendering in `MessageRow`** (line 184)

Current:
```tsx
<div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
  {displayContent}
</div>
```

New: Render `displayContent` through `<ReactMarkdown>` with the same component overrides from `PlanViewer`, but scaled for chat context:
- Smaller headings (h1→text-lg, h2→text-base, etc.) since these are inline in a chat bubble
- Same code block syntax highlighting via `SyntaxHighlighter` + `oneDark`
- Same inline code, bold, links, lists, tables, blockquotes styling
- Wrap in a container div with `prose`-like spacing classes

**3. Keep existing collapse logic as-is** — slicing the raw markdown string before passing to `ReactMarkdown`. Short truncated text renders fine through ReactMarkdown even if it clips mid-syntax, and clicking "Show more" reveals the fully-correct rendering.

## Files referenced

- **Modify:** `app/src/components/ui/transcript-viewer.tsx` — the `MessageRow` component (line 184)
- **Reuse patterns from:** `app/src/components/ui/plan-viewer.tsx` — markdown component overrides (lines 18-120)

## Verification

1. `cd app && npm run build` — no type errors
2. Visit a checkpoint detail page (e.g. `/partio-io/cli/checkpoints/[id]`) → Sessions tab
3. Confirm headings, bold, code blocks, lists render properly in chat bubbles
4. Confirm short plain-text messages still render normally
5. Confirm "Show more"/"Show less" still works on long messages
6. Confirm tool badges still appear below assistant messages
