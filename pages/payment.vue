<template>
  <div>
    <h1>Payment page</h1>

    <p>
      Public key: <code>{{ publicKey }}</code>
    </p>
  </div>
</template>

<script>
export default {
  mounted() {
    if (!this.publicKey) {
      console.warn(
        `Missing public key (${this.publicKey}), redirecting to setup page`,
      )
      this.$router.push('/')
    }
  },

  computed: {
    publicKey() {
      return this.$route.query.publicKey
    },
  },
}
</script>
