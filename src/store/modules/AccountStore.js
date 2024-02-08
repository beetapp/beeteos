const LOAD_ACCOUNTS = 'LOAD_ACCOUNTS';
const CHOOSE_ACCOUNT = 'CHOOSE_ACCOUNT';
const ADD_ACCOUNT = 'ADD_ACCOUNT';
const CLEAR_ACCOUNTS = 'CLEAR_ACCOUNTS';

const mutations = {
    [LOAD_ACCOUNTS](state, accounts) {
        state.accountlist = accounts;
        state.selectedIndex = 0;
    },
    [CHOOSE_ACCOUNT](state, accountIndex) {
        state.selectedIndex = accountIndex;
    },
    [ADD_ACCOUNT](state, account) {
        state.accountlist.push(account);
        state.selectedIndex = state.accountlist.length - 1;
    },
    [CLEAR_ACCOUNTS](state) {
        state.selectedIndex = null;
        state.accountlist = [];
    }
};

const actions = {
    addAccount({
        dispatch,
        commit,
        state
    }, payload) {
        return new Promise((resolve, reject) => {
            let existingAccount = state.accountlist.find(
                x => x.chain == payload.account.chain &&
                (x.accountID == payload.account.accountName || x.accountName === payload.account.accountName)
            );

            if (!existingAccount) {
                let _hash = window.electron.sha512(payload.password);
                for (let keytype in payload.account.keys) {
                    payload.account.keys[keytype] = window.electron.aesEncrypt(
                        payload.account.keys[keytype],
                        _hash
                    );
                }

                dispatch('WalletStore/saveAccountToWallet', payload, {root: true})
                .then(() => {
                    commit(ADD_ACCOUNT, payload.account);
                    return resolve('Account added');
                }).catch((error) => {
                    console.log(error)
                    return reject(error);
                });
            } else {
                return reject('Account already exists');
            }
        });
    },
    loadAccounts({
        commit
    }, payload) {
        return new Promise((resolve, reject) => {
            if (payload && payload.length > 0) {
                commit(LOAD_ACCOUNTS, payload);
                resolve('Accounts Loaded');
            } else {
                reject('Empty Account list');
            }
        });
    },
    logout({
        commit
    }) {
        return new Promise((resolve, reject) => {
            commit(CLEAR_ACCOUNTS);
            resolve();
        });
    },
    selectAccount({
        commit,
        state
    }, payload) {
        return new Promise((resolve, reject) => {
            let index = -1;
            for (let i = 0; i < state.accountlist.length; i++) {
                if (
                    (payload.chain == state.accountlist[i].chain) &&
                    (
                        payload.accountID == state.accountlist[i].accountID ||
                        payload.accountID == state.accountlist[i].accountName ||
                        payload.accountName == state.accountlist[i].accountName
                    )
                ) {
                    index = i;
                    break;
                }
            }

            if (index != -1) {
                commit(CHOOSE_ACCOUNT, index);
                resolve('Account found');
            }
        });
    }
}

const getters = {
    getAccount: state => state.accountlist[state.selectedIndex],
    getCurrentSafeAccount: state => () => {
        let currentAccount = state.accountlist[state.selectedIndex];
        return {
            accountID: currentAccount.accountID,
            accountName: currentAccount.accountName,
            chain: currentAccount.chain
        }
    },
    getCurrentIndex: state => state.selectedIndex ?? -1,
    getChain: state => state.accountlist[state.selectedIndex].chain,
    getAccountList: state => state.accountlist,
    getSafeAccountList: state => state.accountlist.map(account => {
      return {
        accountID: account.accountID,
        accountName: account.accountName,
        chain: account.chain
      };
    }),
    getSafeAccount: state => (request) => {
        let safeAccounts = state.accountlist.map(account => {
          return {
            accountID: account.accountID,
            accountName: account.accountName,
            chain: account.chain,
            memoKey: account.keys.memo
          };
        });

        let requestedAccounts = safeAccounts.filter(account => {
            return account.accountID == request.account_id && account.chain == request.chain
                    ? true
                    : false;
        });

        if (!requestedAccounts || !requestedAccounts.length) {
            console.log("Couldn't retrieve account safely.");
            return;
        }

        return requestedAccounts[0];
    },
    getCurrentActiveKey: (state) => () => {
        let currentAccount = state.accountlist[state.selectedIndex];
        return currentAccount.keys.active;
    },
    getEOSKey: (state) => () => {
        let currentAccount = state.accountlist[state.selectedIndex];
        return currentAccount.keys.privateKey;
    },
    getActiveKey: (state) => (request) => {
      let signing = state.accountlist.filter(account => {
          return (
              account.accountID == request.payload.account_id &&
              account.chain == request.payload.chain
          );
      });

      if (!signing || !signing.length) {
          return;
      }

      return signing.slice()[0].keys.active;
    },
    getSigningKey: (state) => (request) => {
        let signing = state.accountlist.filter(account => {
            return (
                account.accountID == request.payload.account_id &&
                account.chain == request.payload.chain
            );
        });

        if (!signing || !signing.length) {
            return;
        }

        let keys = signing.slice()[0].keys;

        return keys.memo
                ? keys.memo
                : keys.active;
    }
};

const initialState = {
    selectedIndex: null,
    accountlist: []
};

export default {
    namespaced: true,
    state: initialState,
    actions,
    mutations,
    getters,
};
