<template>
  <div>
    <h1>Payment page</h1>

    <p>
      ProcessOut public key: <code>{{ processOutPublicKey }}</code>
    </p>

    <p>
      Selected payment method: <code>{{ selectedPaymentMethodId }}</code>
    </p>

    <ul style="list-style:none">
      <li
        v-for="paymentMethod in paymentMethods"
        :key="paymentMethod.id"
        @click="handlePaymentMethodClick(paymentMethod)"
        style="cursor:pointer"
      >
        <fieldset>
          <legend>
            <input
              type="radio"
              :checked="isPaymentMethodSelected(paymentMethod)"
              :disabled="isSubmitting"
            />
            <strong>{{ paymentMethod.label }}</strong>
          </legend>

          <div v-if="isPaymentMethodSelected(paymentMethod)">
            <component
              :is="paymentMethod.adapter"
              :form-id="paymentMethod.id"
              :client-options="paymentMethod.clientOptions"
              @submit-start="handleAdapterSubmitStart"
              @submit-success="handleAdapterSubmitSuccess"
              @submit-error="handleAdapterSubmitError"
            />
          </div>
        </fieldset>
        <br />
      </li>
    </ul>

    <p>
      <!-- Note: form submit button is outside <form> and uses the form attribute -->
      <!-- Read more: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-form -->
      <button
        type="submit"
        :form="selectedPaymentMethodId"
        :disabled="isSubmitting"
      >
        Confirm and pay
      </button>
    </p>

    <p v-if="isSubmitting">
      <strong>Submitting...</strong>
    </p>
    <p v-if="submitResult">
      <strong>Submit result:</strong>
      <pre>{{ submitResult }}</pre>
    </p>
  </div>
</template>

<script>
import CreditCardPaymentMethod from '../components/CreditCardPaymentMethod.vue'
import ProcessOutAlternatePaymentMethod from '../components/ProcessOutAlternatePaymentMethod.vue'

const DEFAULT_PAYMENT_METHOD = 'card'

export default {
  data() {
    return {
      isSubmitting: false,
      selectedPaymentMethodId: DEFAULT_PAYMENT_METHOD,
      submitResult: '',
    }
  },

  mounted() {
    if (!this.processOutPublicKey) {
      console.warn(
        `Missing public key (${this.processOutPublicKey}), redirecting to setup page`,
      )
      this.$router.push('/')
    }
  },

  computed: {
    /**
     * Provider-agnostic payment method list. Each adapter is a Vue compoent,
     * that is a <form id="formId">.
     */
    paymentMethods() {
      return [
        {
          id: 'card',
          label: 'Credit or debit card',
          adapter: CreditCardPaymentMethod,
          clientOptions: {},
        },
        {
          id: 'paypal',
          label: 'PayPal',
          adapter: ProcessOutAlternatePaymentMethod,
          clientOptions: {
            // ProcessOut project ID (aka "public key")
            publicKey: this.processOutPublicKey,

            // Name of the gateway, used to find the correct gateway after
            // having fetched them during the submit process.
            gatewayName: 'paypal-rest'
          },
        },
        {
          id: 'processout-sandbox',
          label: 'ProcessOut sandbox',
          adapter: ProcessOutAlternatePaymentMethod,
          clientOptions: {
            publicKey: this.processOutPublicKey,
            gatewayName: 'sandbox'
          },
        },
      ]
    },

    processOutPublicKey() {
      return this.$route.query.processOutPublicKey
    },
  },

  watch: {
    selectedPaymentMethodId() {
      this.submitResult = ''
    },
  },

  methods: {
    isPaymentMethodSelected(paymentMethod) {
      return this.selectedPaymentMethodId === paymentMethod.id
    },

    handlePaymentMethodClick(paymentMethod) {
      if (this.isSubmitting) {
        return
      }

      this.selectedPaymentMethodId = paymentMethod.id
    },

    handleAdapterSubmitStart() {
      console.info('⏯️ SUBMIT START')
      this.submitResult = ''
      this.isSubmitting = true
    },

    handleAdapterSubmitSuccess(submitResultData) {
      console.info('✅ SUBMIT SUCCESS', submitResultData)
      this.isSubmitting = false
      this.submitResult = JSON.stringify(submitResultData, null, 2)
    },

    handleAdapterSubmitError(error) {
      console.error('❌ SUBMIT ERROR', error, { ...error })
      this.isSubmitting = false
      this.submitResult = [
        error.message,
        error.stack,
        '',
        ...Object.entries({ ...error }).map(([key, value]) => `${key}: ${value}`)
      ].join('\n')
    },
  },
}
</script>
