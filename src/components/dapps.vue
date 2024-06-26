<script setup>
    import { watchEffect, ref, computed, onMounted } from 'vue';
    import { useI18n } from 'vue-i18n';

    import store from '../store/index.js';
    import router from '../router/index.js';
    import {formatAccount} from "../lib/formatter.js";

    const { t } = useI18n({ useScope: 'global' });
    let tableData = ref();

    function fetchDapps() {
        let storedDapps = [];
        for (let i = 0; i < store.state.AccountStore.accountlist.length; i++) {
            let apps = store.getters['OriginStore/walletAccessibleDapps'](
                store.state.AccountStore.accountlist[i].accountID
                    ? store.state.AccountStore.accountlist[i].accountID
                    : store.state.AccountStore.accountlist[i].accountName,
                store.state.AccountStore.accountlist[i].chain
            );
            if (typeof apps != 'undefined') {
                storedDapps = storedDapps.concat(apps);
            }
        }
        return storedDapps;
    }

    let dapps = computed(() => {
        let storedDapps = [];
        for (let i = 0; i < store.state.AccountStore.accountlist.length; i++) {
            let apps = store.getters['OriginStore/walletAccessibleDapps'](
                store.state.AccountStore.accountlist[i].accountID
                    ? store.state.AccountStore.accountlist[i].accountID
                    : store.state.AccountStore.accountlist[i].accountName,
                store.state.AccountStore.accountlist[i].chain
            );
            if (typeof apps != 'undefined') {
                storedDapps = storedDapps.concat(apps);
            }
        }
        return storedDapps;
    })

    function getDisplayString(accountID, chain) {
        let account = store.getters['AccountStore/getSafeAccount']({account_id: accountID, chain: chain});
        return formatAccount(account);
    }

    watchEffect(() => {
        if (dapps.value && dapps.value.length) {
            tableData.value = {
                data: dapps.value.map(dapp => {
                    return {
                        appName: dapp.appName,
                        origin: dapp.origin,
                        displayString: getDisplayString(dapp.account_id, dapp.chain),
                        chain: dapp.chain,
                        injectables: dapp.injectables && dapp.injectables.length
                            ? dapp.injectables.length
                            : '100%',
                        actions: dapp.id
                    }
                }),
                thead: [
                    t('common.appname_lbl'),
                    t('common.origin_lbl'),
                    t('common.account_lbl'),
                    t('common.chain_lbl'),
                    t('common.actions_approvedOps'),
                    t('common.actions_lbl')
                ],
                tbody: ['appName', 'origin', 'displayString', 'chain', 'injectables', {slot: 'actions'}]
            };
        }
    });

    async function deleteDapp(dapp_id) {
        window.electron.resetTimer();
        await store.dispatch('OriginStore/removeApp', dapp_id);
        dapps.value = fetchDapps();
    }

    onMounted(() => {
        if (!store.state.WalletStore.isUnlocked) {
            console.log("logging user out...");
            store.dispatch("WalletStore/logout");
            router.replace("/");
            return;
        }
    });
</script>

<template>
    <div
        class="dapp-list mt-2"
        style="text-align: center; margin-top: auto; margin-bottom: auto;"
    >
        <p>
            <u>{{ t('common.dapps_lbl') }}</u>
        </p>
        <span v-if="tableData">
            <ui-table
                v-shadow="5"
                :data="tableData.data"
                :thead="tableData.thead"
                :tbody="tableData.tbody"
                style="padding:5px;"
            >
                <template #actions="{ data }">
                    <ui-button
                        raised
                        @click="deleteDapp(data.actions)"
                    >
                        {{ t('common.delete_btn') }}
                    </ui-button>
                </template>
            </ui-table>
        </span>
        <span v-else>
            <em>{{ t('common.no_dapps_linked') }}</em>
            <br>
        </span>
        <router-link
            :to="'/dashboard'"
            replace
            style="text-decoration: none;"
        >
            <ui-button
                outlined
                class="step_btn"
                style="margin-top:20px;"
            >
                Exit dApps
            </ui-button>
        </router-link>
    </div>
</template>
