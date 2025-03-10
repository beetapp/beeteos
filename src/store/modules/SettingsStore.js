import { defaultLocale } from '../../config/i18n.js'
import {blockchains} from '../../config/config.js';
import BeetDB from '../../lib/BeetDB.js';

const LOAD_SETTINGS = 'LOAD_SETTINGS';

function decodeMessage(bytes) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(new Uint8Array(bytes));
}

const mutations = {
    [LOAD_SETTINGS] (state, settings) {
        state.settings = settings;
    }
};

const actions = {
    loadSettings({
        commit
    }) {
        return new Promise(async (resolve, reject) => {
            try {
                BeetDB.settings.get({id: 'settings'}).then((settings) => {
                    if (settings && settings.length > 0) {
                        commit(LOAD_SETTINGS, JSON.parse(settings));
                    } else {
                        BeetDB.settings.put({id: 'settings', value: JSON.stringify(initialState.settings)}).then(() => {
                            commit(LOAD_SETTINGS, JSON.parse(initialState.settings));
                        })
                    }
                });
                resolve();
            } catch (error) {
                console.log(error)
                reject();
            }
        });
    },
    setNode({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {

            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }
  
                // backwards compatibility
                if (typeof settings.selected_node === "string") {
                    settings.selected_node = {}
                }
  
                try {
                  settings.selected_node[payload.chain] = payload.node;
                } catch (error) {
                  console.log(`setNode: ${error}`)
                }

                let chainNodeList = settings.chainNodes[payload.chain];
                if (chainNodeList && chainNodeList.length > payload.node) {
                    let node = chainNodeList.splice(payload.node, 1)[0];
                    chainNodeList.unshift(node);
                }
                
                try {
                    settings.chainNodes[payload.chain] = chainNodeList;
                } catch (error) {
                    console.log(`setNodeList: ${error}`)
                }

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setNode: ${error}`)
                reject(error);
            });
        });
    },
    setLocale({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {

            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }

                settings.locale = payload.locale;

                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setLocale: ${error}`)
                reject(error);
            });
        });
    },
    /**
     * 
     * @param {Object} payload
     */
    setChainPermissions({
        commit
    }, payload) {
        return new Promise(async (resolve, reject) => {
            BeetDB.settings.get({id: 'settings'}).then((settings) => {
                if (settings && settings.length > 0) {
                    settings = JSON.parse(settings)
                } else {
                    settings = initialState.settings;
                }
    
                if (!Object.prototype.hasOwnProperty.call(settings, 'chainPermissions')) {
                    settings['chainPermissions'] = {
                        BTS: [],
                        BTS_TEST: [],
                        EOS: [],
                        BEOS: [],
                        TLOS: []
                    }
                }
                settings.chainPermissions[payload.chain] = payload.rows;
                BeetDB.settings.put({id: 'settings', value: JSON.stringify(settings)}).then(() => {
                    commit(LOAD_SETTINGS, settings);
                    resolve();
                })
            }).catch((error) => {
                console.log(`setChainPermissions: ${error}`)
                reject(error);
            });
        });
    },
    visualizeMemo({
        commit
    }, data) {
        const decodedMessage = decodeMessage(data.request.memo.message);
        console.log('Decoded Memo Message:', decodedMessage);
    }
}

const getters = {
    getNode: (state) => state.settings.selected_node,
    getLocale: (state) => state.settings.locale,
    getChainPermissions: (state) => (chain) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'chainPermissions')) {
            return [];
        }
        return state.settings.chainPermissions[chain];
    },
    getNodes: (state) => (chain) => {
        if (!Object.prototype.hasOwnProperty.call(state.settings, 'chainNodes')) {
            return initialState.settings.chainNodes[chain];
        }
        return state.settings.chainNodes[chain];
    }
};

const initialState = {
    settings: {
        locale: defaultLocale,
        selected_node: {},
        chainPermissions: {
            BTS: [],
            TEST: [],
            EOS: [],
            BEOS: [],
            TLOS: []
        },
        chainNodes: {
            BTS: blockchains.BTS.nodeList,
            TEST: blockchains.BTS_TEST.nodeList,
            EOS: blockchains.EOS.nodeList,
            BEOS: blockchains.BEOS.nodeList,
            TLOS: blockchains.TLOS.nodeList
        }
    }
};

export default {
    namespaced: true,
    state: initialState,
    actions,
    mutations,
    getters,
};
