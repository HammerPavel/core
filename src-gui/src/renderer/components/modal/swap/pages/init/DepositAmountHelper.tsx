import { Box, makeStyles, TextField, Typography } from "@material-ui/core";
import { BidQuote } from "models/tauriModel";
import { useState } from "react";
import { useAppSelector } from "store/hooks";
import { btcToSats, satsToBtc } from "utils/conversionUtils";
import { MoneroAmount } from "../../../../other/Units";

const MONERO_FEE = 0.000016;

const useStyles = makeStyles((theme) => ({
  outer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  textField: {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      display: "none",
    },
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
    maxWidth: theme.spacing(16),
  },
}));

function calcBtcAmountWithoutFees(amount: number, fees: number) {
  return amount - fees;
}

export default function DepositAmountHelper({
  min_deposit_until_swap_will_start,
  max_deposit_until_maximum_amount_is_reached,
  min_bitcoin_lock_tx_fee,
  quote,
}: {
  min_deposit_until_swap_will_start: number;
  max_deposit_until_maximum_amount_is_reached: number;
  min_bitcoin_lock_tx_fee: number;
  quote: BidQuote;
}) {
  const classes = useStyles();
  const [amount, setAmount] = useState(min_deposit_until_swap_will_start);
  const bitcoinBalance = useAppSelector((s) => s.rpc.state.balance) || 0;

  function getTotalAmountAfterDeposit() {
    return amount + bitcoinBalance;
  }

  function hasError() {
    return (
      amount < min_deposit_until_swap_will_start ||
      getTotalAmountAfterDeposit() > max_deposit_until_maximum_amount_is_reached
    );
  }

  function calcXMRAmount(): number | null {
    if (Number.isNaN(amount)) return null;
    if (hasError()) return null;
    if (quote.price == null) return null;

    return (
      calcBtcAmountWithoutFees(
        getTotalAmountAfterDeposit(),
        min_bitcoin_lock_tx_fee,
      ) /
        quote.price -
      MONERO_FEE
    );
  }

  return (
    <Box className={classes.outer}>
      <Typography variant="subtitle2">
        Depositing {bitcoinBalance > 0 && <>another</>}
      </Typography>
      <TextField
        error={!!hasError()}
        value={satsToBtc(amount)}
        onChange={(e) => setAmount(btcToSats(parseFloat(e.target.value)))}
        size="small"
        type="number"
        className={classes.textField}
      />
      <Typography variant="subtitle2">
        BTC will give you approximately{" "}
        <MoneroAmount amount={calcXMRAmount()} />.
      </Typography>
    </Box>
  );
}
