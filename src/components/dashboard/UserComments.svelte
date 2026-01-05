<script lang="ts">
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

onMount(async () => {
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
})
</script>

<div class="comments-container">
  <div class="header">
    <h2>{t.title}</h2>
    <p class="description">{t.description}</p>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <div class="skeleton skeleton-item"></div>
      <div class="skeleton skeleton-item"></div>
      <div class="skeleton skeleton-item"></div>
    </div>
  {:else if comments.length === 0}
    <p class="no-comments">{t.noComments}</p>
  {:else}
    <ul class="comment-list">
      {#each comments as comment (comment.id)}
        <li class="comment-item" class:deleted={comment.deletedAt !== null}>
          <div class="comment-meta">
            <span class="comment-date">{formatDate(comment.createdAt)}</span>
            {#if comment.isEdited}
              <span class="edited-badge">({t.edited})</span>
            {/if}
            <span class="status-badge" class:approved={comment.isApproved} class:deleted={comment.deletedAt !== null}>
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
  .comments-container {
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    padding: 1.5rem;
  }

  .header h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  .description {
    font-size: 0.9rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    margin: 0.5rem 0 1.5rem;
  }

  .error {
    padding: 0.75rem;
    background: hsl(0 80% 95%);
    border: 1px solid hsl(0 70% 80%);
    border-radius: 6px;
    color: hsl(0 70% 40%);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .no-comments {
    text-align: center;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
    padding: 2rem;
  }

  .comment-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .comment-item {
    padding: 1rem;
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 25%));
    border-radius: 6px;
    margin-bottom: 0.75rem;
  }

  .comment-item.deleted {
    opacity: 0.6;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .comment-date {
    font-size: 0.8rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .edited-badge {
    font-size: 0.75rem;
    color: light-dark(hsl(0 0% 60%), hsl(0 0% 50%));
    font-style: italic;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
    background: light-dark(hsl(45 80% 90%), hsl(45 50% 25%));
    color: light-dark(hsl(45 80% 35%), hsl(45 70% 70%));
  }

  .status-badge.approved {
    background: light-dark(hsl(142 70% 90%), hsl(142 40% 20%));
    color: light-dark(hsl(142 60% 30%), hsl(142 60% 70%));
  }

  .status-badge.deleted {
    background: light-dark(hsl(0 70% 95%), hsl(0 40% 20%));
    color: light-dark(hsl(0 60% 40%), hsl(0 60% 70%));
  }

  .comment-content {
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 0.75rem;
    color: light-dark(hsl(0 0% 20%), hsl(0 0% 85%));
  }

  .note-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: light-dark(hsl(0 0% 97%), hsl(0 0% 15%));
    border-radius: 4px;
    text-decoration: none;
    color: inherit;
    font-size: 0.85rem;
    transition: background-color 0.2s;
  }

  .note-link:hover {
    background: light-dark(hsl(0 0% 94%), hsl(0 0% 18%));
  }

  .note-title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-note {
    color: var(--color-main);
    font-weight: 500;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }

  .loading {
    padding: 1rem 0;
  }

  .skeleton {
    background: light-dark(hsl(0 0% 92%), hsl(0 0% 18%));
    border-radius: 6px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-item {
    height: 100px;
    margin-bottom: 0.75rem;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
