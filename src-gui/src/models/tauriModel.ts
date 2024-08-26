/*
 Generated by typeshare 1.9.2
*/

/**
 * Represent a timelock, expressed in relative block height as defined in
 * [BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki).
 * E.g. The timelock expires 10 blocks after the reference transaction is
 * mined.
 */
export type CancelTimelock = number;

/**
 * Represent a timelock, expressed in relative block height as defined in
 * [BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki).
 * E.g. The timelock expires 10 blocks after the reference transaction is
 * mined.
 */
export type PunishTimelock = number;

export type Amount = number;

export interface BuyXmrArgs {
	seller: string;
	bitcoin_change_address: string;
	monero_receive_address: string;
}

export interface ResumeArgs {
	swap_id: string;
}

export interface CancelAndRefundArgs {
	swap_id: string;
}

export interface MoneroRecoveryArgs {
	swap_id: string;
}

export interface WithdrawBtcArgs {
	amount?: number;
	address: string;
}

export interface BalanceArgs {
	force_refresh: boolean;
}

export interface ListSellersArgs {
	rendezvous_point: string;
}

export interface StartDaemonArgs {
	server_address: string;
}

export interface GetSwapInfoArgs {
	swap_id: string;
}

export interface ResumeSwapResponse {
	result: string;
}

export interface BalanceResponse {
	balance: number;
}

/** Represents a quote for buying XMR. */
export interface BidQuote {
	/** The price at which the maker is willing to buy at. */
	price: number;
	/**
	 * The minimum quantity the maker is willing to buy.
	 * #[typeshare(serialized_as = "number")]
	 */
	min_quantity: number;
	/** The maximum quantity the maker is willing to buy. */
	max_quantity: number;
}

export interface BuyXmrResponse {
	swap_id: string;
	quote: BidQuote;
}

export interface GetHistoryEntry {
	swap_id: string;
	state: string;
}

export interface GetHistoryResponse {
	swaps: GetHistoryEntry[];
}

export interface Seller {
	peer_id: string;
	addresses: string[];
}

export type ExpiredTimelocks = 
	| { type: "None", content: {
	blocks_left: number;
}}
	| { type: "Cancel", content: {
	blocks_left: number;
}}
	| { type: "Punish", content?: undefined };

export interface GetSwapInfoResponse {
	swap_id: string;
	seller: Seller;
	completed: boolean;
	start_date: string;
	state_name: string;
	xmr_amount: number;
	btc_amount: number;
	tx_lock_id: string;
	tx_cancel_fee: number;
	tx_refund_fee: number;
	tx_lock_fee: number;
	btc_refund_address: string;
	cancel_timelock: CancelTimelock;
	punish_timelock: PunishTimelock;
	timelock?: ExpiredTimelocks;
}

export interface WithdrawBtcResponse {
	amount: number;
	txid: string;
}

export interface SuspendCurrentSwapResponse {
	swap_id: string;
}

export type TauriSwapProgressEvent = 
	| { type: "Initiated", content?: undefined }
	| { type: "ReceivedQuote", content: BidQuote }
	| { type: "WaitingForBtcDeposit", content: {
	deposit_address: string;
	max_giveable: number;
	min_deposit_until_swap_will_start: number;
	max_deposit_until_maximum_amount_is_reached: number;
	min_bitcoin_lock_tx_fee: number;
	quote: BidQuote;
}}
	| { type: "Started", content: {
	btc_lock_amount: number;
	btc_tx_lock_fee: number;
}}
	| { type: "BtcLockTxInMempool", content: {
	btc_lock_txid: string;
	btc_lock_confirmations: number;
}}
	| { type: "XmrLockTxInMempool", content: {
	xmr_lock_txid: string;
	xmr_lock_tx_confirmations: number;
}}
	| { type: "XmrLocked", content?: undefined }
	| { type: "BtcRedeemed", content?: undefined }
	| { type: "XmrRedeemInMempool", content: {
	xmr_redeem_txid: string;
	xmr_redeem_address: string;
}}
	| { type: "BtcCancelled", content: {
	btc_cancel_txid: string;
}}
	| { type: "BtcRefunded", content: {
	btc_refund_txid: string;
}}
	| { type: "BtcPunished", content?: undefined }
	| { type: "AttemptingCooperativeRedeem", content?: undefined }
	| { type: "CooperativeRedeemAccepted", content?: undefined }
	| { type: "CooperativeRedeemRejected", content: {
	reason: string;
}}
	| { type: "Released", content?: undefined };

export interface TauriSwapProgressEventWrapper {
	swap_id: string;
	event: TauriSwapProgressEvent;
}
