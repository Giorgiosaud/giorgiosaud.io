<script lang="ts">
import Turnstile from '@components/Turnstile.svelte'
import '@be-partner-labs/ds/components/alert'
import '@be-partner-labs/ds/components/button'
import '@be-partner-labs/ds/components/input'

interface Props {
  noteId: string
  parentId?: string
  onSubmit: (comment: unknown) => void
  onCancel?: () => void
  lang: 'en' | 'es'
  turnstileSiteKey?: string
}

const translations = {
  en: {
    writeComment: 'Write a comment...',
    cancel: 'Cancel',
    post: 'Post',
    verifying: 'Verifying...',
    verificationFailed: 'Verification failed. Please try again.',
  },
  es: {
    writeComment: 'Escribe un comentario...',
    cancel: 'Cancelar',
    post: 'Publicar',
    verifying: 'Verificando...',
    verificationFailed: 'Verificacion fallida. Intenta de nuevo.',
  },
}

let { noteId, parentId, onSubmit, onCancel, lang, turnstileSiteKey }: Props =
  $props()

let content = $state('')
let isSubmitting = $state(false)
let submitError = $state<string | null>(null)
let turnstileToken = $state<string | null>(null)
let turnstileError = $state(false)
let turnstileRef: Turnstile | null = $state(null)

const t = $derived(translations[lang])
const canSubmit = $derived(
  content.trim() && (turnstileToken || !turnstileSiteKey) && !isSubmitting,
)

function handleTurnstileVerify(token: string) {
  turnstileToken = token
  turnstileError = false
}

function handleTurnstileError() {
  turnstileError = true
  turnstileToken = null
}

function handleTurnstileExpire() {
  turnstileToken = null
}

async function handleSubmit(e: Event) {
  e.preventDefault()
  if (!content.trim() || isSubmitting) return
  if (turnstileSiteKey && !turnstileToken) return

  isSubmitting = true
  submitError = null
  try {
    const res = await fetch('/api/comments/index.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        noteId,
        content: content.trim(),
        parentId,
        turnstileToken,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Failed to post')
    }

    onSubmit(data.comment)
    content = ''
    submitError = null
    turnstileToken = null
    turnstileRef?.reset()
    onCancel?.()
  } catch (err) {
    console.error('Failed to post comment:', err)
    submitError = err instanceof Error ? err.message : 'Failed to post comment'
    // Reset turnstile on error
    turnstileToken = null
    turnstileRef?.reset()
  } finally {
    isSubmitting = false
  }
}
</script>

<form onsubmit={handleSubmit} class="form">
  <textarea
    bind:value={content}
    placeholder={t.writeComment}
    aria-label={t.writeComment}
    class="bp-input"
    rows="3"
    maxlength="5000"
    disabled={isSubmitting}
  ></textarea>

  {#if turnstileSiteKey}
    <Turnstile
      bind:this={turnstileRef}
      siteKey={turnstileSiteKey}
      onVerify={handleTurnstileVerify}
      onError={handleTurnstileError}
      onExpire={handleTurnstileExpire}
      size="normal"
    />
    {#if turnstileError}
      <div class="bp-alert bp-alert--error" role="alert">
      <div class="bp-alert__content">
        <p class="bp-alert__body">{t.verificationFailed}</p>
      </div>
    </div>
    {/if}
  {/if}

  {#if submitError}
    <div class="bp-alert bp-alert--error" role="alert">
      <div class="bp-alert__content">
        <p class="bp-alert__body">{submitError}</p>
      </div>
    </div>
  {/if}

  <div class="form-actions">
    {#if onCancel}
      <button type="button" onclick={onCancel} class="bp-btn bp-btn--secondary bp-btn--sm"
        >{t.cancel}</button
      >
    {/if}
    <button type="submit" disabled={!canSubmit} class="bp-btn bp-btn--sm">
      {isSubmitting ? "..." : t.post}
    </button>
  </div>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-2);
    margin-block-end: 2lh;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--bp-space-2);
  }
</style>
