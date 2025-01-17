import { Box, makeStyles } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab/";
import {
  BobStateName,
  GetSwapInfoResponseExt,
  GetSwapInfoResponseExtRunningSwap,
  isGetSwapInfoResponseRunningSwap,
  isGetSwapInfoResponseWithTimelock,
  TimelockCancel,
  TimelockNone,
} from "models/tauriModelExt";
import { ReactNode } from "react";
import { exhaustiveGuard } from "utils/typescriptUtils";
import HumanizedBitcoinBlockDuration from "../../other/HumanizedBitcoinBlockDuration";
import TruncatedText from "../../other/TruncatedText";
import { SwapMoneroRecoveryButton } from "../../pages/history/table/SwapMoneroRecoveryButton";
import { TimelockTimeline } from "./TimelockTimeline";

const useStyles = makeStyles((theme) => ({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  list: {
    padding: "0px",
    margin: "0px",
    "& li": {
      marginBottom: theme.spacing(0.5),
      "&:last-child": {
        marginBottom: 0
      }
    },
  },
  alertMessage: {
    flexGrow: 1,
  },
}));

/**
 * Component for displaying a list of messages.
 * @param messages - Array of messages to display.
 * @returns JSX.Element
 */
function MessageList({ messages }: { messages: ReactNode[]; }) {
  const classes = useStyles();

  return (
    <ul className={classes.list}>
      {messages.filter(msg => msg != null).map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  );
}

/**
 * Sub-component for displaying alerts when the swap is in a safe state.
 * @param swap - The swap information.
 * @returns JSX.Element
 */
function BitcoinRedeemedStateAlert({ swap }: { swap: GetSwapInfoResponseExt; }) {
  const classes = useStyles();
  return (
    <Box className={classes.box}>
      <MessageList
        messages={[
          "The Bitcoin has been redeemed by the other party",
          "There is no risk of losing funds. Take as much time as you need",
          "The Monero will automatically be redeemed to your provided address once you resume the swap",
          "If this step fails, you can manually redeem your funds",
        ]} />
      <SwapMoneroRecoveryButton swap={swap} size="small" variant="contained" />
    </Box>
  );
}

/**
 * Sub-component for displaying alerts when the swap is in a state with no timelock info.
 * @param swap - The swap information.
 * @param punishTimelockOffset - The punish timelock offset.
 * @returns JSX.Element
 */
function BitcoinLockedNoTimelockExpiredStateAlert({
  timelock, cancelTimelockOffset, punishTimelockOffset, isRunning,
}: {
  timelock: TimelockNone;
  cancelTimelockOffset: number;
  punishTimelockOffset: number;
  isRunning: boolean;
}) {
  return (
    <MessageList
      messages={[
        isRunning ? "We are waiting for the other party to lock their Monero" : null,
        <>
          If the swap isn't completed in {" "}
          <HumanizedBitcoinBlockDuration
            blocks={timelock.content.blocks_left}
            displayBlocks={false}
          />, it needs to be refunded
        </>,
        "For that, you need to have the app open sometime within the refund period",
        <>
          After that, cooperation from the other party would be required to recover the funds
        </>,
        isRunning ? null : "Please resume the swap to continue"
      ]} />
  );
}

/**
 * Sub-component for displaying alerts when the swap timelock is expired
 * The swap could be cancelled but not necessarily (the transaction might not have been published yet)
 * But it doesn't matter because the swap cannot be completed anymore
 * @param swap - The swap information.
 * @returns JSX.Element
 */
function BitcoinPossiblyCancelledAlert({
  swap, timelock,
}: {
  swap: GetSwapInfoResponseExt;
  timelock: TimelockCancel;
}) {
  return (
    <MessageList
      messages={[
        "The swap is being cancelled because it was not completed in time",
        "To refund your Bitcoin, resume the swap",
        <>
          If we haven't refunded in{" "}
          <HumanizedBitcoinBlockDuration
            blocks={timelock.content.blocks_left} />
          , cooperation from the other party will be required to recover the funds
        </>
      ]} />
  );
}

/**
 * Sub-component for displaying alerts requiring immediate action.
 * @returns JSX.Element
 */
function PunishTimelockExpiredAlert() {
  return (
    <MessageList
      messages={[
        "We couldn't refund within the refund period",
        "We might still be able to redeem the Monero. However, this will require cooperation from the other party",
        "Resume the swap as soon as possible",
      ]} />
  );
}

/**
 * Main component for displaying the appropriate swap alert status text.
 * @param swap - The swap information.
 * @returns JSX.Element | null
 */
export function StateAlert({ swap, isRunning }: { swap: GetSwapInfoResponseExtRunningSwap; isRunning: boolean; }) {

  switch (swap.state_name) {
    // This is the state where the swap is safe because the other party has redeemed the Bitcoin
    // It cannot be punished anymore
    case BobStateName.BtcRedeemed:
      return <BitcoinRedeemedStateAlert swap={swap} />;

    // These are states that are at risk of punishment because the Bitcoin have been locked
    // but has not been redeemed yet by the other party
    case BobStateName.BtcLocked:
    case BobStateName.XmrLockProofReceived:
    case BobStateName.XmrLocked:
    case BobStateName.EncSigSent:
    case BobStateName.CancelTimelockExpired:
    case BobStateName.BtcCancelled:
      if (swap.timelock != null) {
        switch (swap.timelock.type) {
          case "None":
            return (
              <BitcoinLockedNoTimelockExpiredStateAlert
                timelock={swap.timelock}
                cancelTimelockOffset={swap.cancel_timelock}
                punishTimelockOffset={swap.punish_timelock}
                isRunning={isRunning}
              />
            );
          case "Cancel":
            return (
              <BitcoinPossiblyCancelledAlert
                timelock={swap.timelock}
                swap={swap}
              />
            );
          case "Punish":
            return <PunishTimelockExpiredAlert />;
          default:
            // We have covered all possible timelock states above
            // If we reach this point, it means we have missed a case
            exhaustiveGuard(swap.timelock);
        }
      }
      return <PunishTimelockExpiredAlert />;

    default:
      exhaustiveGuard(swap.state_name);
  }
}

/**
 * Main component for displaying the swap status alert.
 * @param swap - The swap information.
 * @returns JSX.Element | null
 */
export default function SwapStatusAlert({
  swap,
  isRunning,
}: {
  swap: GetSwapInfoResponseExt;
  isRunning: boolean;
}): JSX.Element | null {
  const classes = useStyles();

  // If the swap is completed, we do not need to display anything
  if (!isGetSwapInfoResponseRunningSwap(swap)) {
    return null;
  }

  // If we don't have a timelock for the swap, we cannot display the alert
  if (!isGetSwapInfoResponseWithTimelock(swap)) {
    return null;
  }

  return (
    <Alert
      key={swap.swap_id}
      severity="warning"
      variant="filled"
      classes={{ message: classes.alertMessage }}
    >
      <AlertTitle>
        {isRunning ? "Swap has been running for a while" : <>Swap <TruncatedText>{swap.swap_id}</TruncatedText> is not running</>}
      </AlertTitle>
      <Box className={classes.box}>
        <StateAlert swap={swap} isRunning={isRunning} />
        <TimelockTimeline swap={swap} />
      </Box>
    </Alert>
  );
}
