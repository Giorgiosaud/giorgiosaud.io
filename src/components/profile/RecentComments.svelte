<script lang="ts">
interface Props {
  comments: Array<{
    id: string
    content: string
    createdAt: string
    note: {
      title: string
      url: string
    } | null
  }>
  lang?: 'en' | 'es'
}

const translations = {
  en: {
    on: 'on',
  },
  es: {
    on: 'en',
  },
}

let { comments, lang = 'en' }: Props = $props()

const t = $derived(translations[lang])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>

<ul class="comments-list">
  {#each comments as comment (comment.id)}
    <li class="comment-item">
      <p class="comment-content">{comment.content}</p>
      <div class="comment-meta">
        <span class="comment-date">{formatDate(comment.createdAt)}</span>
        {#if comment.note}
          <span class="comment-note">
            {t.on} <a href={comment.note.url}>{comment.note.title}</a>
          </span>
        {/if}
      </div>
    </li>
  {/each}
</ul>

<style>
  .comments-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .comment-item {
    padding: var(--bp-space-4);
    background: var(--bp-color-bg-elevated);
    border: 1px solid var(--bp-color-border);
    border-radius: var(--bp-radius-lg);
    margin-bottom: var(--bp-space-3);
  }

  .comment-content {
    margin: 0 0 var(--bp-space-3);
    line-height: var(--bp-leading-normal);
    color: var(--bp-color-text);
  }

  .comment-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--bp-space-2);
    font-size: var(--bp-text-sm);
    color: var(--bp-color-text-muted);
  }

  .comment-note a {
    color: var(--site-color-accent);
    text-decoration: none;
  }

  .comment-note a:hover {
    text-decoration: underline;
  }
</style>
