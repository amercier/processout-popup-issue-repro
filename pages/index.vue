<template>
  <div>
    <h1>Setup page</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        ProcessOut project's public key:
        <input autofocus v-model="processOutPublicKey" required />
      </label>

      <p>
        <button type="submit">Go to payment</button>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      processOutPublicKey: '',
    }
  },

  methods: {
    async handleSubmit() {
      this.$router.push({
        path: '/payment',
        query: {
          processOutPublicKey: this.processOutPublicKey,
        },
      })
    },
  },
}
</script>
