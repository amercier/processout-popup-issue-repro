<template>
  <form :id="formId" @submit.prevent="handleSubmit">
    <p>
      <!-- Actually the client status, not the library, but  the point is to show it is lazy-loaded -->
      ProcessOut library status: <strong>{{ libraryStatus }}</strong>
    </p>

    <p>
      <label>
        Invoice ID:
        <input type="text" required v-model="invoiceId" />
        <small>(typically created by back-end, here for testing)</small>
      </label>
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
      invoiceId: '',
    }
  },

  methods: {
    async handleSubmit() {
      this.$emit('submit-start')

      try {
        // 1. Lazy-load the ProcessOut library & initialize client
        const client = await this.setupProcessOutClient()
        console.info('CLIENT INITIALIZED', client)

        // 2. Fetch gateway configurations from ProcessOut
        const gateways = await this.fetchGatewayConfigurations(client)
        console.info('FETCHED GATEWAY CONFIGURATIONS', gateways)

        // 3. Determine the gateway to use
        const gateway = this.findGateway(gateways)
        console.info('FOUND GATEWAY TO USE', gateway)

        // 4. Invoke gateway configuration invoice action
        const token = await this.handleInvoiceAction(gateway)
        console.info('INVOKED GATEWAY ACTION', token)

        this.$emit('submit-success', { token })
      } catch (error) {
        this.$emit('submit-error', error)
      }
    },

    async setupProcessOutClient() {
      this.libraryStatus = 'loading'

      try {
        const ProcessOutLibrary = await loadProcessOutLibrary()
        const client = new ProcessOutLibrary.ProcessOut(
          this.clientOptions.publicKey,
        )

        this.libraryStatus = 'ok'
        return client
      } catch (error) {
        this.libraryStatus = 'error'
        throw error
      }
    },

    fetchGatewayConfigurations(client) {
      return new Promise((resolve, reject) => {
        client.fetchGatewayConfigurations(
          {
            invoiceID: this.invoiceId,
            filter: 'alternative-payment-methods',
          },
          resolve,
          reject,
        )
      })
    },

    findGateway(gateways) {
      const gateway = gateways.find(
        gateway => gateway.gateway.name === this.clientOptions.gatewayName,
      )

      if (!gateway) {
        throw new Error(
          `Could not find gateway "${this.clientOptions.gatewayName}"`,
        )
      }

      return gateway
    },

    handleInvoiceAction(gateway) {
      return new Promise((resolve, reject) => {
        gateway.handleInvoiceAction(resolve, reject)
      })
    },
  },
}
</script>
