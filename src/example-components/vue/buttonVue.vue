<script setup>
import { onMounted, ref } from 'vue'

const count = ref(0)
onMounted(async () => {
  setTimeout(() => count.value++, 1000)
})
</script>

<template>
  <div class="vue-component">
    <h3>
      Vue Button was clicked {{ count }} {{ count === 1 ? "time" : "times" }}
    </h3>
    <button class="vue-button" @click="count++">Increment Count Vue</button>
  </div>
</template>
<style>
h3,
button {
  font-family: Verdana, Arial, sans-serif;
}
.vue-button {
  background: hsl(from green h s calc(l * 1.1));
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  &:hover {
    background: hsl(from green h s calc(l * 0.8));
  }
}
.vue-component {
  border: green solid 2px;
  padding: 1rem;
  margin: 3rem;
}
</style>
