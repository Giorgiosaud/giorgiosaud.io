<script lang="ts">
import type { User } from 'better-auth/types'
import CommentForm from './CommentForm.svelte'
import CommentItem from './CommentItem.svelte'
import '@be-partner-labs/ds/components/button'
import '@be-partner-labs/ds/components/input'

interface Comment {
  id: string
  content: string
  parentId: string | null
  depth: number
  userId: string
  isEdited: boolean
  createdAt: string
  editedAt: string | null
  authorName?: string | null
  authorImage?: string | null
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

let {
  comment,
  noteId,
  user,
  onReply,
  onUpdate,
  onDelete,
  lang,
  turnstileSiteKey,
}: Props = $props()

let isReplying = $state(false)
let isEditing = $state(false)
let editContent = $derived(comment.content)

const t = $derived(translations[lang])
const isOwner = $derived(user?.id === comment.userId)
const isAdmin = $derived(
  (
    user as
      | (User & {
          role?: string
        })
      | null
  )?.role === 'admin',
)
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
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content: editContent.trim(),
      }),
    })
    if (!res.ok) throw new Error('Failed to update')
    const { comment: updated } = await res.json()
    onUpdate({
      ...comment,
      ...updated,
    })
    isEditing = false
  } catch (err) {
    console.error('Failed to update:', err)
  }
}

async function handleDelete() {
  if (!confirm(t.confirmDelete)) return
  try {
    const res = await fetch(`/api/comments/${comment.id}.json`, {
      method: 'DELETE',
      credentials: 'include',
    })
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

<article class="comment">
  <header class="comment-header">
    {#if comment.authorImage}
      <img src={comment.authorImage} alt="" class="avatar" />
    {:else}
      <span class="avatar-placeholder"
        >{(comment.authorName || "U")[0].toUpperCase()}</span
      >
    {/if}
    <span class="author">{comment.authorName || "Anonymous"}</span>
    <time class="time" datetime={comment.createdAt}>
      {formatDate(comment.createdAt)}
    </time>
    {#if comment.isEdited}
      <span class="edited">({t.edited})</span>
    {/if}
  </header>

  {#if isEditing}
    <div class="edit-form">
      <textarea
        bind:value={editContent}
        class="bp-input"
        rows="3"
        aria-label={t.edit}
      ></textarea>
      <div class="form-actions">
        <button
          type="button"
          onclick={() => (isEditing = false)}
          class="bp-btn bp-btn--secondary bp-btn--sm">{t.cancel}</button
        >
        <button type="button" class="bp-btn bp-btn--sm" onclick={handleEdit}
          >{t.save}</button
        >
      </div>
    </div>
  {:else}
    <p class="content">{comment.content}</p>
  {/if}

  <footer class="comment-footer">
    {#if user && canReply}
      <button
        type="button"
        onclick={() => (isReplying = !isReplying)}
        class="action-btn"
      >
        {t.reply}
      </button>
    {/if}
    {#if canModify && !isEditing}
      <button
        type="button"
        onclick={() => (isEditing = true)}
        class="action-btn">{t.edit}</button
      >
      <button type="button" class="action-btn" onclick={handleDelete}
        >{t.delete}</button
      >
    {/if}
  </footer>

  {#if isReplying}
    <div class="reply-form">
      <CommentForm
        {noteId}
        parentId={comment.id}
        onSubmit={handleReplySubmit}
        onCancel={() => (isReplying = false)}
        {lang}
        {turnstileSiteKey}
      />
    </div>
  {/if}

  {#if comment.replies && comment.replies.length > 0}
    <div class="replies">
      {#each comment.replies as reply (reply.id)}
        <CommentItem
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
  .comment-header {
    display: flex;
    align-items: center;
    gap: var(--bp-space-2);
    font-size: var(--bp-text-sm);
    margin-block-end: var(--bp-space-2);
  }

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: var(--bp-radius-full);
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: var(--bp-radius-full);
    background: var(--bp-primary);
    color: var(--bp-primary-fg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--bp-text-xs);
    font-weight: var(--bp-font-weight-semibold);
  }

  .author {
    font-weight: var(--bp-font-weight-semibold);
  }

  .time {
    color: var(--bp-color-text-muted);
  }

  .edited {
    color: var(--bp-color-text-muted);
    font-style: italic;
    font-size: var(--bp-text-xs);
  }

  .content {
    margin: 0;
    line-height: var(--bp-leading-loose);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-footer {
    display: flex;
    gap: var(--bp-space-4);
    margin-block-start: var(--bp-space-2);
  }

  .action-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
    cursor: pointer;
    transition: color var(--bp-duration-fast) var(--bp-ease);
  }

  .action-btn:hover {
    color: var(--site-color-accent);
  }

  .action-btn:focus-visible {
    outline: none;
    box-shadow: var(--bp-focus-ring);
    border-radius: var(--bp-radius-sm);
  }

  .reply-form {
    margin-block-start: var(--bp-space-4);
    padding-inline-start: var(--bp-space-4);
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-2);
    margin-block: var(--bp-space-2);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--bp-space-2);
  }

  /* Nesting is structural: each level of .replies indents once */
  .replies {
    margin-block-start: var(--bp-space-4);
    padding-inline-start: var(--bp-space-6);
    border-inline-start: 2px solid var(--bp-color-border);
    display: flex;
    flex-direction: column;
    gap: var(--bp-space-4);
  }
</style>
