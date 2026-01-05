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
    padding: 1rem;
    background: light-dark(white, hsl(0 0% 12%));
    border: 1px solid light-dark(hsl(0 0% 90%), hsl(0 0% 22%));
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }

  .comment-content {
    margin: 0 0 0.75rem;
    line-height: 1.5;
    color: light-dark(hsl(0 0% 20%), hsl(0 0% 85%));
  }

  .comment-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: light-dark(hsl(0 0% 50%), hsl(0 0% 55%));
  }

  .comment-note a {
    color: var(--color-main);
    text-decoration: none;
  }

  .comment-note a:hover {
    text-decoration: underline;
  }
</style>
