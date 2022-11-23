<template>
  <form :id="formId" @submit.prevent="handleSubmit">
    <p>
      <label>
        Card holder
        <input type="text" required :disabled="isSubmitting" />
      </label>
    </p>
    <p>
      <label>
        Card number
        <input type="text" required :disabled="isSubmitting" />
      </label>
    </p>
    <p>
      <label>
        Expiration date
        <input type="text" required :disabled="isSubmitting" />
      </label>
    </p>
    <p>
      <label>
        Security code
        <input type="text" required :disabled="isSubmitting" />
      </label>
    </p>
  </form>
</template>

<script>
export default {
  props: {
    formId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      isSubmitting: false,
    }
  },

  methods: {
    async handleSubmit() {
      this.isSubmitting = true
      this.$emit('submit-start')

      await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })

      this.isSubmitting = false
      this.$emit('submit-success', { ok: true })
    },
  },
}
</script>
