<script lang="ts">
  import type { User } from 'better-auth/types'
  import CommentForm from './CommentForm.svelte'

  interface Comment {
    id: string
    content: string
    parentId: string | null
    depth: number
    userId: string
    isEdited: boolean
    createdAt: string
    editedAt: string | null
    replies?: Comment[]
  }

  interface Props {
    comment: Comment
    noteId: string
    user: User | null
    onReply: (comment: Comment) => void
    onUpdate: (comment: Comment) => void
    onDelete: (id: string) => void
    lang: 'en' | 'es'
    turnstileSiteKey?: string
  }

  const translations = {
    en: {
      reply: 'Reply',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      edited: 'edited',
      confirmDelete: 'Delete this comment?',
    },
    es: {
      reply: 'Responder',
      edit: 'Editar',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      save: 'Guardar',
      edited: 'editado',
      confirmDelete: 'Eliminar este comentario?',
    },
  }

  let { comment, noteId, user, onReply, onUpdate, onDelete, lang, turnstileSiteKey }: Props = $props()

  let isReplying = $state(false)
  let isEditing = $state(false)
  let editContent = $state(comment.content)

  const t = $derived(translations[lang])
  const isOwner = $derived(user?.id === comment.userId)
  const isAdmin = $derived((user as (User & { role?: string }) | null)?.role === 'admin')
  const canModify = $derived(isOwner || isAdmin)
  const canReply = $derived(comment.depth < 3)

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  async function handleEdit() {
    if (!editContent.trim()) return
    try {
      const res = await fetch(`/api/comments/${comment.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const { comment: updated } = await res.json()
      onUpdate({ ...comment, ...updated })
      isEditing = false
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  async function handleDelete() {
    if (!confirm(t.confirmDelete)) return
    try {
      const res = await fetch(`/api/comments/${comment.id}.json`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete(comment.id)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  function handleReplySubmit(newComment: Comment) {
    onReply(newComment)
    isReplying = false
  }
</script>

<article class="comment" style="--depth: {comment.depth}">
  <header class="comment-header">
    <span class="author">User {comment.userId.slice(0, 8)}</span>
    <time class="time" datetime={comment.createdAt}>
      {formatDate(comment.createdAt)}
    </time>
    {#if comment.isEdited}
      <span class="edited">({t.edited})</span>
    {/if}
  </header>

  {#if isEditing}
    <div class="edit-form">
      <textarea bind:value={editContent} class="textarea" rows="3"></textarea>
      <div class="form-actions">
        <button type="button" onclick={() => isEditing = false} class="cancel-btn">{t.cancel}</button>
        <button type="button" class="submit-btn" onclick={handleEdit}>{t.save}</button>
      </div>
    </div>
  {:else}
    <p class="content">{comment.content}</p>
  {/if}

  <footer class="comment-footer">
    {#if user && canReply}
      <button type="button" onclick={() => isReplying = !isReplying} class="action-btn">
        {t.reply}
      </button>
    {/if}
    {#if canModify && !isEditing}
      <button type="button" onclick={() => isEditing = true} class="action-btn">{t.edit}</button>
      <button type="button" class="action-btn" onclick={handleDelete}>{t.delete}</button>
    {/if}
  </footer>

  {#if isReplying}
    <div class="reply-form">
      <CommentForm
        {noteId}
        parentId={comment.id}
        onSubmit={handleReplySubmit}
        onCancel={() => isReplying = false}
        {lang}
        {turnstileSiteKey}
      />
    </div>
  {/if}

  {#if comment.replies && comment.replies.length > 0}
    <div class="replies">
      {#each comment.replies as reply (reply.id)}
        <svelte:self
          comment={reply}
          {noteId}
          {user}
          {onReply}
          {onUpdate}
          {onDelete}
          {lang}
          {turnstileSiteKey}
        />
      {/each}
    </div>
  {/if}
</article>

<style>
  .comment {
    padding-left: calc(var(--depth, 0) * 1.5rem);
    border-left: calc(var(--depth, 0) * 2px) solid light-dark(hsl(0 0% 85%), hsl(0 0% 25%));
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-block-end: 0.5rem;
  }

  .author {
    font-weight: 600;
  }

  .time {
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 60%));
  }

  .edited {
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 60%));
    font-style: italic;
    font-size: 0.8rem;
  }

  .content {
    margin: 0;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-footer {
    display: flex;
    gap: 1rem;
    margin-block-start: 0.5rem;
  }

  .action-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.85rem;
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
    cursor: pointer;
    transition: color 0.2s;
  }

  .action-btn:hover {
    color: var(--color-main);
  }

  .reply-form {
    margin-block-start: 1rem;
    padding-left: 1rem;
  }

  .edit-form {
    margin-block: 0.5rem;
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

  .cancel-btn {
    background: transparent;
    border: 1px solid light-dark(hsl(0 0% 70%), hsl(0 0% 40%));
  }

  .replies {
    margin-block-start: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
