<script lang="ts">
interface Props {
  noteId: string
  lang?: 'en' | 'es'
}
let { noteId, lang = 'en' }: Props = $props()
</script>
<p>Comments for {noteId}</p>
