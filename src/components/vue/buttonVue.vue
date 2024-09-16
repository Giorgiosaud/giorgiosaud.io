<script setup>
import { ref, onMounted } from "vue";

const count = ref(0);
onMounted(async () => {
  setTimeout(() => count.value++, 1000);
});
</script>

<template>
  <div class="border-green-400 border-solid border-2 p-1 m-3">
    <h3>
      Vue Button was clicked {{ count }} {{ count === 1 ? "time" : "times" }}
    </h3>
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="count++"
    >
      Increment Count Vue
    </button>
  </div>
</template>
<style>
h3,
button {
  font-family: Verdana, Arial, sans-serif;
}
</style>
