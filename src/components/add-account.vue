<script setup>
    import { watch, ref, computed } from "vue";
    import { useI18n } from 'vue-i18n';

    import ImportCloudPass from "./blockchains/bitshares/ImportCloudPass";
    import ImportBinFile from "./blockchains/bitshares/ImportBinFile";
    import ImportMemo from "./blockchains/bitshares/ImportMemo";
    import ImportKeys from "./blockchains/ImportKeys";

    import store from '../store/index.js';
    import router from '../router/index.js';
    import { blockchains } from "../config/config.js";
    import { watchEffect } from "vue";

    const { t } = useI18n({ useScope: 'global' });

    let importMethod = ref(null);
    let walletname = ref("");
    let password = ref("");
    let step = ref(1);
    let stepMessage = ref(t('common.step_counter', {step_no: 1}));

    watch(step, async (newVal, oldVal) => {
        if (newVal !== oldVal) {
            if (store.state.WalletStore.isUnlocked) {
                window.electron.resetTimer();
            }
            stepMessage.value = t('common.step_counter', {step_no: newVal});
        }
    }, {immediate: true});

    let s1c = ref("");
    let selectedChain = ref(0);
    let selectedImport = ref(0);

    let accounts_to_import = ref(null);
    let confirmPassword = ref(null);

    /*
     * Check if the user has a wallet already
     */
    let userHasWallet = computed(() => {
        let hasWallet;
        try {
            hasWallet = store.getters['WalletStore/getHasWallet'];
        } catch (error) {
            console.log(error);
            return [];
        }
        return hasWallet;
    });

    /*
     * Array of supported blockchains for select menu
     */
    let chainList = computed(() => {
        return Object.values(blockchains).sort((a, b) => {
            if (!!a.testnet != !!b.testnet) {
                return a.testnet ? 1 : -1;
            }
            return a.name > b.name;
        });
    });

    /*
     * Array of supported blockchains for select menu
     */
    let createNewWallet = computed(() => {
        return !store.state.WalletStore.isUnlocked;
    });

    let selectedImportOptions = ref([]);
    watchEffect(() => {
        async function lookup() {
            let blockchainResponse;
            try {
                blockchainResponse = await window.electron.blockchainRequest({
                    methods: ["getImportOptions"],
                    chain: selectedChain.value
                });
            } catch (error) {
                console.log(error);
                return;
            }
            
            if (blockchainResponse.getImportOptions) {
                selectedImportOptions.value = blockchainResponse.getImportOptions;
            }
        }

        if (selectedChain.value) {
            lookup();
        }
    });

    /*
     * Reset selections if the selectedChain changes
     */
    watch(selectedChain, async (newVal, oldVal) => {
        if (newVal !== oldVal) {
            if (store.state.WalletStore.isUnlocked) {
                window.electron.resetTimer();
            }
            selectedImport.value = 0;
        }
    }, {immediate: true});

    /*
     * Returns the selected import type
     */
    let selectedImportOption = computed(() => {
        if (!selectedChain.value || !selectedChain.value) {
            return null;
        }

        let useImport = !selectedImport.value || !selectedImport.value
            ? selectedImportOptions.value[0]
            : selectedImport.value;

        return selectedImportOptions.value.find(option => { return option.type == useImport.type; });
    });

    /*
     * Return add account wizard to step 1
     */
    function step1() {
        step.value = 1;
    }

    /*
     * Second step of account wizard
     */
    function step2() {

        if (userHasWallet.value == true && createNewWallet.value == false) { // add to logged in wallet
            console.log('adding to existing wallet')
            step.value = 2;
            let fetchedName;
            try {
                fetchedName = store.getters['WalletStore/getWalletName'];
            } catch (error) {
                console.log(error);
                return;
            }
            walletname.value = fetchedName;
            return;
        }

        if (walletname.value.trim() == "") {
            window.electron.notify(t("common.empty_wallet_error"));
            s1c.value = "is-invalid";
            return;
        }

        let walletList = store.getters['WalletStore/getWalletList'];
        if (walletList.map(wallet => wallet.name).includes(walletname.value.trim())) {
            window.electron.notify(t("common.duplicate_wallet_error"));
            s1c.value = "is-invalid";
            return;
        }

        walletname.value = walletname.value.trim();
        step.value = 2;
    }

    /*
     * Notify user of errors
     */
    function _handleError(err) {
        if (err == "invalid") {
            window.electron.notify(t("common.invalid_password"));
        } else if (err == "update_failed") {
            window.electron.notify(t("common.update_failed"));
        } else if (err.key) {
            window.electron.notify(t(`common.${err.key}`));
        } else {
            window.electron.notify(err.toString());
        }
    }

    /*
     * Final third step of add account wizard.
     */
    async function addAccounts() {
        if (!accounts_to_import.value) {
            window.electron.notify(t(`common.addAccount.none_selected`));
            return;
        }

        if (!password.value || password.value === "") {
            window.electron.notify(t(`common.confirm_pass_error`));
            return;
        }

        if ((!userHasWallet.value || createNewWallet.value) && password.value !== confirmPassword.value) {
            window.electron.notify(t(`common.confirm_pass_error`));
            return;
        }

        for (let i in accounts_to_import.value) {
            let account = accounts_to_import.value[i];
            if (!userHasWallet.value || createNewWallet.value) {
                // User is creating a new wallet
                try {
                    await store.dispatch("WalletStore/saveWallet", {
                        walletname: walletname.value,
                        password: password.value,
                        walletdata: account.account
                    });
                } catch (error) {
                    console.log(error);
                    _handleError(error);
                }
            } else {
                // User is adding an account to an existing wallet
                account.password = password.value;
                account.walletname = walletname.value;

                try {
                    await store.dispatch("AccountStore/addAccount", account);
                } catch (error) {
                    console.log(error);
                    _handleError(error);
                }
            }
        }

        if (store.state.WalletStore.isUnlocked) {
            store.dispatch("WalletStore/logout");
        }
        router.replace("/");
    }
</script>

<template>
    <div class="bottom p-0">
        <div class="content px-3">
            <h4 class="h4 mt-3 font-weight-bold">
                {{ stepMessage }}
            </h4>
            <div
                v-if="step == 1"
                id="step1"
            >
                <template v-if="createNewWallet">
                    <p
                        v-tooltip="t('common.tooltip_friendly_cta')"
                        class="my-3 font-weight-bold"
                    >
                        {{ t('common.friendly_cta') }} &#10068;
                    </p>
                    <input
                        id="inputWallet"
                        v-model="walletname"
                        type="text"
                        class="form-control mb-3"
                        :class="s1c"
                        :placeholder="t('common.walletname_placeholder')"
                        required
                        @focus="s1c = ''"
                    >
                </template>
                <p
                    v-tooltip="t('common.tooltip_chain_cta')"
                    class="my-3 font-weight-bold"
                >
                    {{ t('common.chain_cta') }} &#10068;
                </p>
                <select
                    id="chain-select"
                    v-model="selectedChain"
                    class="form-control mb-3"
                    :class="s1c"
                    :placeholder="t('common.chain_placeholder')"
                    required
                >
                    <option
                        selected
                        disabled
                        value="0"
                    >
                        {{ t('common.select_chain') }}
                    </option>
                    <option
                        v-for="chain in chainList"
                        :key="chain.identifier"
                        :value="chain.identifier"
                    >
                        <span v-if="chain.testnet">
                            Testnet: {{ chain.name }} ({{ chain.identifier }})
                        </span>
                        <span v-else>
                            {{ chain.name }} ({{ chain.identifier }})
                        </span>
                    </option>
                </select>
                <div v-if="selectedImportOptions.length > 0">
                    <p class="my-3 font-weight-bold">
                        {{ t('common.bts_importtype_cta') }}
                    </p>
                    <select
                        id="import-select"
                        v-model="selectedImport"
                        class="form-control mb-3"
                        :class="s1c"
                        :placeholder="t('common.import_placeholder')"
                        required
                    >
                        <option
                            key="0"
                            selected
                            disabled
                            value="0"
                        >
                            {{ t('common.import_placeholder') }}
                        </option>
                        <option
                            v-for="option in selectedImportOptions"
                            :key="option.type"
                            :value="option"
                        >
                            {{ t(`common.${option.translate_key}`) }}
                        </option>
                    </select>
                </div>

                <ui-grid>
                    <ui-grid-cell columns="12">
                        <router-link
                            :to="createNewWallet ? '/' : '/dashboard'"
                            replace
                        >
                            <ui-button
                                raised
                                class="step_btn"
                            >
                                {{ t('common.cancel_btn') }}
                            </ui-button>
                        </router-link>

                        <span v-if="selectedImportOptions.length > 0">
                            <span v-if="selectedImport != 0">
                                <ui-button
                                    raised
                                    class="step_btn"
                                    type="submit"
                                    @click="step2"
                                >
                                    {{ t('common.next_btn') }}
                                </ui-button>
                            </span>
                            <span v-else>
                                <ui-button
                                    disabled
                                    class="step_btn"
                                    type="submit"
                                >
                                    {{ t('common.next_btn') }}
                                </ui-button>
                            </span>
                        </span>
                        <span v-else>
                            <span v-if="walletname !== '' && selectedChain !== 0">
                                <ui-button
                                    raised
                                    class="step_btn"
                                    type="submit"
                                    @click="step2"
                                >
                                    {{ t('common.next_btn') }}
                                </ui-button>
                            </span>
                            <span v-else>
                                <ui-button
                                    disabled
                                    class="step_btn"
                                    type="submit"
                                >
                                    {{ t('common.next_btn') }}
                                </ui-button>
                            </span>
                        </span>
                    </ui-grid-cell>
                </ui-grid>
            </div>
            <div
                v-else-if="step == 2"
                id="step2"
            >
                <ImportKeys
                    v-if="selectedImportOption.type == 'ImportKeys'"
                    v-model="importMethod"
                    :chain="selectedChain"
                    @back="() => step -= 1"
                    @continue="() => step = 3"
                    @imported="(x) => accounts_to_import = x"
                />
                <ImportCloudPass
                    v-else-if="selectedImportOption.type == 'bitshares/ImportCloudPass'"
                    v-model="importMethod"
                    :chain="selectedChain"
                    @back="() => step -= 1"
                    @continue="() => step = 3"
                    @imported="(x) => accounts_to_import = x"
                />
                <ImportBinFile
                    v-else-if="selectedImportOption.type == 'bitshares/ImportBinFile'"
                    v-model="importMethod"
                    :chain="selectedChain"
                    @back="() => step -= 1"
                    @continue="() => step = 3"
                    @imported="(x) => accounts_to_import = x"
                />
                <ImportMemo
                    v-else-if="selectedImportOption.type == 'bitshares/ImportMemo'"
                    v-model="importMethod"
                    :chain="selectedChain"
                    @back="() => step -= 1"
                    @continue="() => step = 3"
                    @imported="(x) => accounts_to_import = x"
                />
                <div v-else>
                    No import option found
                </div>
            </div>
            <div
                v-else-if="step == 3"
                id="step3"
            >
                <div>
                    <p
                        v-tooltip="t('common.tooltip_password_cta')"
                        class="mb-2 font-weight-bold"
                    >
                        <span v-if="createNewWallet">
                            {{ t('common.password_cta') }} &#10068;
                        </span>
                        <span v-else>
                            {{ t('common.unlock_with_password_cta') }} &#10068;
                        </span>
                    </p>
                    <input
                        id="inputPass"
                        v-model="password"
                        type="password"
                        class="form-control mb-3"
                        :placeholder="t('common.password_placeholder')"
                        required
                    >
                    <template v-if="createNewWallet">
                        <p class="mb-2 font-weight-bold">
                            {{ t('common.confirm_cta') }}
                        </p>
                        <input
                            id="inputConfirmPass"
                            v-model="confirmPassword"
                            type="password"
                            class="form-control mb-3"
                            :placeholder="t('common.confirm_placeholder')"
                            required
                        >
                    </template>
                </div>

                <ui-button
                    raised
                    type="submit"
                    class="step_btn"
                    @click="addAccounts"
                >
                    {{ t('common.next_btn') }}
                </ui-button>
            </div>
        </div>
    </div>
</template>
