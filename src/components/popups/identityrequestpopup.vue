<script setup>
    import { computed } from "vue";
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n({ useScope: 'global' });

    const props = defineProps({
        request: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        accounts: {
            type: Array,
            required: true,
            default() {
                return []
            }
        }
    });

    let account_id = computed(() => {
        if (!props.accounts || !props.accounts.length) {
            return '';
        }
        return props.accounts[0].accountID
            ? props.accounts[0].accountID
            : props.accounts[0].accountName;
    });

    let accountName = computed(() => {
        if (!props.accounts || !props.accounts.length) {
            return '';
        }
        return props.accounts[0].accountName;
    });

    let chain = computed(() => {
        if (!props.accounts || !props.accounts.length) {
            return '';
        }

        return props.accounts[0].chain;
    });

    let requestText = computed(() => {
        if (!props.request) {
            return '';
        }

        return t(
            'operations.account_id.request',
            {
                appName: props.request.payload.appName,
                origin: props.request.payload.origin,
                chain: chain.value,
                accountId: account_id.value,
                accountName: accountName.value
            }
        );
    });

    function _clickedAllow() {
        window.electron.clickedAllow({
            result: {
                name: accountName.value,
                chain: chain.value,
                id: account_id.value
            },
            request: {id: props.request.id}
        });
    }

    function _clickedDeny() {
        window.electron.clickedDeny({
            result: {canceled: true},
            request: {id: props.request.id}
        });
    }
</script>

<template>
    <div style="padding:5px">
        <div v-tooltip="t('operations.identity.request_tooltip')">
            {{ requestText }} &#10068;
        </div>
        <ui-button
            raised
            style="margin-right:5px"
            @click="_clickedAllow()"
        >
            {{ t('operations.account_id.accept_btn') }}
        </ui-button>
        <ui-button
            raised
            @click="_clickedDeny()"
        >
            {{ t('operations.account_id.reject_btn') }}
        </ui-button>
    </div>
</template>
