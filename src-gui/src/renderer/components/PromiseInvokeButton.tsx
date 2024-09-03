import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Tooltip,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useSnackbar } from "notistack";
import { ReactNode, useState } from "react";
import { useIsContextAvailable } from "store/hooks";

interface PromiseInvokeButtonProps<T> {
  onSuccess: (data: T) => void | null;
  onClick: () => Promise<T>;
  onPendingChange: (isPending: boolean) => void | null;
  isLoadingOverride: boolean;
  isIconButton: boolean;
  loadIcon: ReactNode;
  disabled: boolean;
  displayErrorSnackbar: boolean;
  tooltipTitle: string | null;
  requiresContext: boolean;
}

export default function PromiseInvokeButton<T>({
  disabled = false,
  onSuccess = null,
  onClick,
  endIcon,
  loadIcon = null,
  isLoadingOverride = false,
  isIconButton = false,
  displayErrorSnackbar = false,
  onPendingChange = null,
  requiresContext = true,
  tooltipTitle = null,
  ...rest
}: ButtonProps & PromiseInvokeButtonProps<T>) {
  const { enqueueSnackbar } = useSnackbar();
  const isContextAvailable = useIsContextAvailable();

  const [isPending, setIsPending] = useState(false);

  const isLoading = isPending || isLoadingOverride;
  const actualEndIcon = isLoading
    ? loadIcon || <CircularProgress size={24} />
    : endIcon;

  async function handleClick() {
    if (!isPending) {
      try {
        onPendingChange?.(true);
        setIsPending(true);
        const result = await onClick();
        onSuccess?.(result);
      } catch (e: unknown) {
        if (displayErrorSnackbar) {
          enqueueSnackbar(e as string, {
            autoHideDuration: 60 * 1000,
            variant: "error",
          });
        }
      } finally {
        setIsPending(false);
        onPendingChange?.(false);
      }
    }
  }

  const requiresContextButNotAvailable = requiresContext && !isContextAvailable;
  const isDisabled = disabled || isLoading || requiresContextButNotAvailable;

  const actualTooltipTitle =
    (requiresContextButNotAvailable
      ? "Wait for the application to load all required components"
      : tooltipTitle) ?? "";

  return (
    <Tooltip title={actualTooltipTitle}>
      <span>
        {isIconButton ? (
          <IconButton
            onClick={handleClick}
            disabled={isDisabled}
            {...(rest as IconButtonProps)}
          >
            {actualEndIcon}
          </IconButton>
        ) : (
          <Button
            onClick={handleClick}
            disabled={isDisabled}
            endIcon={actualEndIcon}
            {...rest}
          />
        )}
      </span>
    </Tooltip>
  );
}
