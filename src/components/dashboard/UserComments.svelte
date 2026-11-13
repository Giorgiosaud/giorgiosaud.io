<script lang="ts">
import '@be-partner-labs/ds/components/card'
import '@be-partner-labs/ds/components/badge'
import '@be-partner-labs/ds/components/alert'
import '@be-partner-labs/ds/components/skeleton'
import { onMount } from 'svelte'

interface Props {
  lang?: 'en' | 'es'
}

interface CommentItem {
  id: string
  content: string
  noteSelfHealing: string
  isApproved: boolean
  isEdited: boolean
  createdAt: string
  deletedAt: string | null
  note: {
    title: string
    url: string
  } | null
}

const translations = {
  en: {
    title: 'My Comments',
    description: "View all comments you've posted on notes.",
    noComments: "You haven't made any comments yet.",
    viewNote: 'View Note',
    pending: 'Pending',
    approved: 'Approved',
    deleted: 'Deleted',
    edited: 'edited',
  },
  es: {
    title: 'Mis Comentarios',
    description: 'Ve todos los comentarios que has publicado en las notas.',
    noComments: 'Aun no has hecho ningun comentario.',
    viewNote: 'Ver Nota',
    pending: 'Pendiente',
    approved: 'Aprobado',
    deleted: 'Eliminado',
    edited: 'editado',
  },
}

let { lang = 'en' }: Props = $props()

let comments = $state<CommentItem[]>([])
let isLoading = $state(true)
let error = $state<string | null>(null)

const t = $derived(translations[lang])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content
  return `${content.substring(0, maxLength).trim()}...`
}

onMount(() => {
  async function getComments() {
    try {
      const res = await fetch('/api/dashboard/comments.json')
      const data = await res.json()
      if (data.comments) {
        comments = data.comments
      }
    } catch (err) {
      console.error('Failed to load comments:', err)
      error = 'Failed to load comments'
    } finally {
      isLoading = false
    }
  }
  getComments()
})
</script>

<div class="bp-card comments-container">
  <div class="header">
    <h2>{t.title}</h2>
    <p class="description">{t.description}</p>
  </div>

  {#if error}
    <div class="bp-alert bp-alert--error" role="alert">
      <div class="bp-alert__content">
        <p class="bp-alert__title">{error}</p>
      </div>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading" aria-busy="true">
      <div class="bp-skeleton skeleton-item"></div>
      <div class="bp-skeleton skeleton-item"></div>
      <div class="bp-skeleton skeleton-item"></div>
    </div>
  {:else if comments.length === 0}
    <p class="no-comments">{t.noComments}</p>
  {:else}
    <ul class="comment-list">
      {#each comments as comment (comment.id)}
        <li class="comment-item" data-deleted={comment.deletedAt !== null ? 'true' : undefined}>
          <div class="comment-meta">
            <span class="comment-date">{formatDate(comment.createdAt)}</span>
            {#if comment.isEdited}
              <span class="edited-badge">({t.edited})</span>
            {/if}
            <span
              class="bp-badge status-badge"
              class:bp-badge--error={comment.deletedAt !== null}
              class:bp-badge--success={comment.deletedAt === null && comment.isApproved}
              class:bp-badge--warning={comment.deletedAt === null && !comment.isApproved}
            >
              {#if comment.deletedAt}
                {t.deleted}
              {:else if comment.isApproved}
                {t.approved}
              {:else}
                {t.pending}
              {/if}
            </span>
          </div>

          <p class="comment-content">{truncateContent(comment.content)}</p>

          {#if comment.note}
            <a href={comment.note.url} class="note-link">
              <span class="note-title">{comment.note.title}</span>
              <span class="view-note">{t.viewNote}</span>
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .header h2 {
    font-size: var(--bp-text-xl);
    margin: 0;
  }

  .description {
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
    margin: var(--bp-space-2) 0 0;
  }

  .no-comments {
    text-align: center;
    color: var(--bp-color-text-muted);
    padding: var(--bp-space-8);
  }

  .comment-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .comment-item {
    padding: var(--bp-space-4);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-md);
    margin-bottom: var(--bp-space-3);
  }

  .comment-item[data-deleted='true'] {
    opacity: 0.6;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: var(--bp-space-2);
    margin-bottom: var(--bp-space-2);
    flex-wrap: wrap;
  }

  .comment-date {
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
  }

  .edited-badge {
    font-size: var(--bp-text-xs);
    color: var(--bp-color-text-muted);
    font-style: italic;
  }

  .status-badge {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .comment-content {
    font-size: var(--bp-text-sm);
    line-height: var(--bp-leading-normal);
    margin: 0 0 var(--bp-space-3);
    color: var(--bp-color-text);
  }

  .note-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--bp-space-2) var(--bp-space-3);
    background: var(--bp-color-bg-subtle);
    border-radius: var(--bp-radius-sm);
    text-decoration: none;
    color: inherit;
    font-size: var(--bp-text-sm);
    transition: background-color var(--bp-duration-fast) var(--bp-ease);
  }

  .note-link:hover {
    background: color-mix(in srgb, var(--bp-color-text) 6%, var(--bp-color-bg-subtle));
  }

  .note-link:focus-visible {
    outline: none;
    box-shadow: var(--bp-focus-ring);
  }

  .note-title {
    font-weight: var(--bp-font-weight-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-note {
    color: var(--site-color-accent);
    font-weight: var(--bp-font-weight-medium);
    flex-shrink: 0;
    margin-left: var(--bp-space-2);
  }

  .loading {
    padding: var(--bp-space-4) 0;
  }

  .skeleton-item {
    height: 100px;
    margin-bottom: var(--bp-space-3);
  }
</style>
