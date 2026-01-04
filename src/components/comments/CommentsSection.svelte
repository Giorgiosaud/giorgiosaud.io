<script lang="ts">
  import { onMount } from 'svelte'
  import { $user as userStore, $isAuthenticated as isAuthenticatedStore, initAuthState } from '@lib/stores/auth'
  import type { User } from 'better-auth/types'
  import CommentForm from './CommentForm.svelte'
  import CommentItem from './CommentItem.svelte'

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
    noteId: string
    lang?: 'en' | 'es'
    turnstileSiteKey?: string
  }

  const translations = {
    en: {
      comments: 'Comments',
      noComments: 'No comments yet. Be the first to share your thoughts!',
      loginToComment: 'Sign in to leave a comment',
      loadingComments: 'Loading comments...',
      errorLoading: 'Failed to load comments',
    },
    es: {
      comments: 'Comentarios',
      noComments: 'Aun no hay comentarios. Se el primero en compartir tus ideas!',
      loginToComment: 'Inicia sesion para comentar',
      loadingComments: 'Cargando comentarios...',
      errorLoading: 'Error al cargar comentarios',
    },
  }

  let { noteId, lang = 'en', turnstileSiteKey }: Props = $props()

  let user = $state<User | null>(null)
  let isAuthenticated = $state(false)
  let comments = $state<Comment[]>([])
  let isLoading = $state(true)
  let error = $state<string | null>(null)

  const t = $derived(translations[lang])

  onMount(() => {
    initAuthState()

    const unsub1 = userStore.subscribe(v => user = v)
    const unsub2 = isAuthenticatedStore.subscribe(v => isAuthenticated = v)

    fetchComments()

    return () => {
      unsub1()
      unsub2()
    }
  })

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments/note/${noteId}.json`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      comments = data.comments || []
      error = null
    } catch {
      error = t.errorLoading
    } finally {
      isLoading = false
    }
  }

  function handleNewComment(newComment: Comment) {
    if (newComment.parentId) {
      comments = addReplyToTree(comments, newComment)
    } else {
      comments = [...comments, newComment]
    }
  }

  function handleUpdateComment(updated: Comment) {
    comments = updateCommentInTree(comments, updated)
  }

  function handleDeleteComment(id: string) {
    comments = removeCommentFromTree(comments, id)
  }

  function countComments(list: Comment[]): number {
    return list.reduce((acc, c) => acc + 1 + countComments(c.replies || []), 0)
  }

  function addReplyToTree(list: Comment[], reply: Comment): Comment[] {
    return list.map(c => {
      if (c.id === reply.parentId) {
        return { ...c, replies: [...(c.replies || []), reply] }
      }
      if (c.replies?.length) {
        return { ...c, replies: addReplyToTree(c.replies, reply) }
      }
      return c
    })
  }

  function updateCommentInTree(list: Comment[], updated: Comment): Comment[] {
    return list.map(c => {
      if (c.id === updated.id) {
        return { ...c, ...updated }
      }
      if (c.replies?.length) {
        return { ...c, replies: updateCommentInTree(c.replies, updated) }
      }
      return c
    })
  }

  function removeCommentFromTree(list: Comment[], id: string): Comment[] {
    return list
      .filter(c => c.id !== id)
      .map(c => ({
        ...c,
        replies: c.replies ? removeCommentFromTree(c.replies, id) : [],
      }))
  }
</script>

<section class="section">
  <h2>{t.comments} ({countComments(comments)})</h2>

  {#if isLoading}
    <p class="loading">{t.loadingComments}</p>
  {:else}
    {#if error}
      <p class="error">{error}</p>
    {/if}

    {#if isAuthenticated}
      <CommentForm {noteId} onSubmit={handleNewComment} {lang} {turnstileSiteKey} />
    {:else}
      <p class="login-prompt">{t.loginToComment}</p>
    {/if}

    {#if comments.length === 0}
      <p class="empty">{t.noComments}</p>
    {:else}
      <div class="list">
        {#each comments as comment (comment.id)}
          <CommentItem
            {comment}
            {noteId}
            {user}
            onReply={handleNewComment}
            onUpdate={handleUpdateComment}
            onDelete={handleDeleteComment}
            {lang}
            {turnstileSiteKey}
          />
        {/each}
      </div>
    {/if}
  {/if}
</section>

<style>
  .section {
    margin-block: 3lh;
    padding-block-start: 2lh;
    border-top: 1px solid light-dark(var(--color-dark), var(--color-light));
  }

  .section h2 {
    margin-block-end: 1lh;
  }

  .loading,
  .empty,
  .error {
    color: light-dark(hsl(0 0% 40%), hsl(0 0% 60%));
    font-style: italic;
  }

  .error {
    color: hsl(0 70% 50%);
  }

  .login-prompt {
    padding: 1rem;
    background: light-dark(hsl(0 0% 95%), hsl(0 0% 15%));
    border-radius: 8px;
    text-align: center;
    margin-block-end: 1lh;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
