<template>
  <form :id="formId" @submit.prevent="handleSubmit">
    <p>
      <!-- Actually the client status, not the library, but  the point is to show it is lazy-loaded -->
      ProcessOut library status: <strong>{{ libraryStatus }}</strong>
    </p>
  </form>
</template>

<script>
import { loadProcessOutLibrary } from '../lib/processout'

export default {
  props: {
    formId: {
      type: String,
      required: true,
    },

    clientOptions: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      libraryStatus: 'not loaded',
    }
  },

  methods: {
    async handleSubmit() {
      this.$emit('submit-start')

      try {
        await this.setupProcessOutClient()

        this.$emit('submit-success', {})
      } catch (error) {
        this.$emit('submit-error', error)
      }
    },

    async setupProcessOutClient() {
      this.libraryStatus = 'loading'

      try {
        // 1. Lazy-load the ProcessOut library
        const ProcessOutLibrary = await loadProcessOutLibrary()

        // 2. Initialize client
        this.client = new ProcessOutLibrary.ProcessOut(
          this.clientOptions.publicKey,
        )

        // 3. TODO Pay

        this.libraryStatus = 'ok'
      } catch (error) {
        this.libraryStatus = 'error'
        throw error
      }
    },
  },
}
</script>
