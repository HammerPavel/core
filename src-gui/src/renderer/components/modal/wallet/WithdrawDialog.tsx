import { Button, Dialog, DialogActions } from "@material-ui/core";
import { useAppDispatch, useIsRpcEndpointBusy } from "store/hooks";
import { RpcMethod } from "models/rpcModel";
import { rpcResetWithdrawTxId } from "store/features/rpcSlice";
import WithdrawStatePage from "./WithdrawStatePage";
import DialogHeader from "../DialogHeader";
import PromiseInvokeButton from "renderer/components/PromiseInvokeButton";
import { useState } from "react";
import { withdrawBtc } from "renderer/rpc";
import BtcTxInMempoolPageContent from "./pages/BitcoinWithdrawTxInMempoolPage";
import AddressInputPage from "./pages/AddressInputPage";
import WithdrawDialogContent from "./WithdrawDialogContent";

export default function WithdrawDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [withdrawTxId, setWithdrawTxId] = useState<string | null>(null);
  const [withdrawAddressValid, setWithdrawAddressValid] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");

  function onCancel() {
    if (!pending) {
      setWithdrawTxId(null);
      setWithdrawAddress("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogHeader title="Withdraw Bitcoin" />
      <WithdrawDialogContent isPending={pending} withdrawTxId={withdrawTxId}>
        {withdrawTxId === null ? (
          <AddressInputPage
            setWithdrawAddress={setWithdrawAddress}
            withdrawAddress={withdrawAddress}
            setWithdrawAddressValid={setWithdrawAddressValid}
          />
        ) : (
          <BtcTxInMempoolPageContent
            withdrawTxId={withdrawTxId}
            onCancel={onCancel}
          />
        )}
      </WithdrawDialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" disabled={pending}>
          {withdrawTxId === null ? "Cancel" : "Done"}
        </Button>
        {withdrawTxId === null && (
          <PromiseInvokeButton
            displayErrorSnackbar
            variant="contained"
            color="primary"
            disabled={!withdrawAddressValid}
            onClick={() => withdrawBtc(withdrawAddress)}
            onPendingChange={(pending) => {
              console.log("pending", pending);
              setPending(pending);
            }}
            onSuccess={(txId) => {
              setWithdrawTxId(txId);
            }}
          >
            Withdraw
          </PromiseInvokeButton>
        )}
      </DialogActions>
    </Dialog>
  );
}