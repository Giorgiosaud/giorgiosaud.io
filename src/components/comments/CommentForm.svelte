<script lang="ts">
  import Turnstile from '@components/Turnstile.svelte'

  interface Props {
    noteId: string
    parentId?: string
    onSubmit: (comment: any) => void
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

  let { noteId, parentId, onSubmit, onCancel, lang, turnstileSiteKey }: Props = $props()

  let content = $state('')
  let isSubmitting = $state(false)
  let turnstileToken = $state<string | null>(null)
  let turnstileError = $state(false)
  let turnstileRef: Turnstile | null = null

  const t = $derived(translations[lang])
  const canSubmit = $derived(content.trim() && (turnstileToken || !turnstileSiteKey) && !isSubmitting)

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
    try {
      const res = await fetch('/api/comments.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          content: content.trim(),
          parentId,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to post')
      }

      const { comment } = await res.json()
      onSubmit(comment)
      content = ''
      turnstileToken = null
      turnstileRef?.reset()
      onCancel?.()
    } catch (err) {
      console.error('Failed to post comment:', err)
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
    class="textarea"
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
      <p class="error">{t.verificationFailed}</p>
    {/if}
  {/if}

  <div class="form-actions">
    {#if onCancel}
      <button type="button" onclick={onCancel} class="cancel-btn">{t.cancel}</button>
    {/if}
    <button type="submit" disabled={!canSubmit} class="submit-btn">
      {isSubmitting ? '...' : t.post}
    </button>
  </div>
</form>

<style>
  .form {
    margin-block-end: 2lh;
  }

  .textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid light-dark(hsl(0 0% 80%), hsl(0 0% 30%));
    border-radius: 8px;
    background: light-dark(white, hsl(0 0% 10%));
    color: inherit;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 80px;
  }

  .textarea:focus {
    outline: 2px solid var(--color-main);
    outline-offset: 2px;
  }

  .error {
    color: hsl(0 70% 50%);
    font-size: 0.85rem;
    margin: 0;
    text-align: center;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-block-start: 0.5rem;
  }

  .submit-btn,
  .cancel-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-btn {
    background: var(--color-main);
    color: var(--color-light);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: transparent;
    border: 1px solid light-dark(hsl(0 0% 70%), hsl(0 0% 40%));
  }
</style>
