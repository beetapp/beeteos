import { blockchains } from "../config/config.js";

export function formatAccount(account, withTooltip=false) {
    let accountString = account.accountName;
    let displayString = account.accountName;
    if (accountString.length > 20) {
        displayString = displayString.substring(0, 20) + "...";
    }
    if (withTooltip) {
        return `<span v-tooltip="${accountString}">${displayString}</span>`;
    } else {
        return displayString;
    }

}

export function formatChain(chain) {
    if (!blockchains[chain]) {
        return "Unknown blockchain";
    } else {
        return blockchains[chain].name + (blockchains[chain].testnet ? " (Testnet)" : "");
    }
}
