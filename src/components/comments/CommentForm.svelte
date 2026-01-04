<script lang="ts">
  interface Props {
    noteId: string
    parentId?: string
    onSubmit: (comment: any) => void
    onCancel?: () => void
    lang: 'en' | 'es'
  }

  const translations = {
    en: {
      writeComment: 'Write a comment...',
      cancel: 'Cancel',
      post: 'Post',
    },
    es: {
      writeComment: 'Escribe un comentario...',
      cancel: 'Cancelar',
      post: 'Publicar',
    },
  }

  let { noteId, parentId, onSubmit, onCancel, lang }: Props = $props()

  let content = $state('')
  let isSubmitting = $state(false)

  const t = $derived(translations[lang])

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    isSubmitting = true
    try {
      const res = await fetch('/api/comments.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: content.trim(), parentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to post')
      }

      const { comment } = await res.json()
      onSubmit(comment)
      content = ''
      onCancel?.()
    } catch (err) {
      console.error('Failed to post comment:', err)
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
  <div class="form-actions">
    {#if onCancel}
      <button type="button" onclick={onCancel} class="cancel-btn">{t.cancel}</button>
    {/if}
    <button type="submit" disabled={!content.trim() || isSubmitting} class="submit-btn">
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
