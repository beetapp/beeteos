let _blockchains = {
    BTS: {
        coreSymbol: "BTS",
        name: "BitShares",
        chainId:
            "4018d7844c78f6a6c41c6a552b898022310fc5dec06da467ee7905a8dad512c8",
        nodeList: [
            {
                url: "wss://node.xbts.io/ws",
            },
            {
                url: "wss://api.bts.mobi/ws",
            },
            {
                url: "wss://nexus01.co.uk/ws",
            },
            {
                url: "wss://dex.iobanker.com/ws",
            },
            {
                url: "wss://api.dex.trading/",
            },
            {
                url: "wss://api.bitshares.bhuz.info/ws",
            },
            {
                url: "wss://btsws.roelandp.nl/ws",
            },
        ],
    },
    BTS_TEST: {
        coreSymbol: "TEST",
        name: "BitShares",
        testnet: true,
        chainId:
            "39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447",
        nodeList: [
            {
                url: "wss://testnet.xbts.io/ws",
            },
            {
                url: "wss://testnet.dex.trading/",
            },
            {
                url: "wss://api-testnet.61bts.com/ws",
            },
            {
                url: "wss://testnet.bitshares.im/ws",
            },
        ],
    },
    EOS: {
        coreSymbol: "EOS",
        name: "EOSmainnet",
        chainId:
            "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        nodeList: [
            {
                url: "https://eos.greymass.com",
                location: "Unknown",
                region: "Unknown",
                country: "Unknown",
                operator: "Greymass",
                contact: "Greymass",
            },
        ],
    },
    BEOS: {
        coreSymbol: "BEOS",
        name: "BEOSmainnet",
        chainId:
            "cbef47b0b26d2b8407ec6a6f91284100ec32d288a39d4b4bbd49655f7c484112",
        nodeList: [
            {
                url: "https://api.beos.world",
                location: "Unknown",
                region: "Unknown",
                country: "Unknown",
                operator: "BEOS",
                contact: "BEOS",
            },
        ],
    },
    TLOS: {
        coreSymbol: "TLOS",
        name: "Telos",
        chainId:
            "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
        nodeList: [
            {
                url: "https://api.theteloscope.io",
                location: "Unknown",
                region: "Unknown",
                country: "Unknown",
                operator: "Greymass",
                contact: "Greymass",
            },
        ],
    },
};

Object.keys(_blockchains).forEach((key) => {
    _blockchains[key].identifier = key;
});

export const blockchains = _blockchains;
