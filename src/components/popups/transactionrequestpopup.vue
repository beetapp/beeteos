<template>
    <b-modal
            id="type"
            ref="modalComponent"
            centered
            no-close-on-esc
            no-close-on-backdrop
            hide-header-close
            hide-footer
            :title="$t('operations:rawsig.title')"
    >
        {{ $t('operations:rawsig.request',{appName: incoming.appName,origin: incoming.origin , chain: incoming.signingAccount.chain, accountName: incoming.signingAccount.accountName}) }}
        <br>
        <br>
        <pre
                v-if="!!incoming.params"
                class="text-left custom-content"
        >
<code>
{
{{ incoming.params }}
}
</code>
            </pre>
        {{ $t('operations:rawsig.request_cta') }}
        <b-btn
                class="mt-3"
                variant="success"
                block
                @click="_clickedAllow"
        >
            {{ $t('operations:rawsig.accept_btn') }}
        </b-btn>
        <b-btn
                class="mt-1"
                variant="danger"
                block
                @click="_clickedDeny"
        >
            {{ $t('operations:rawsig.reject_btn') }}
        </b-btn>
    </b-modal>
</template>
<script>
    import AbstractPopup from "./abstractpopup";
    import RendererLogger from "../../lib/RendererLogger";
    import getBlockchain from "../../lib/blockchains/blockchainFactory";
    const logger = new RendererLogger();

    export default {
        name: "TransactionRequestPopup",
        extends: AbstractPopup,
        data() {
            return {
                type: "TransactionRequestPopup",
                incoming: {
                    signingAccount: {}
                }
            };
        },
        methods: {
            _execute: async function () {
                let blockchain = getBlockchain(this.incoming.chain);
                let transaction = await blockchain.sign(
                    this.incoming.params,
                    this.incoming.signingAccount.keys.active
                );
                return await blockchain.broadcast(transaction);
            }
        }
    };
</script> 