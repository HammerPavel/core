import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, List, ListItem, ListItemText, TextField } from "@material-ui/core";
import { TextFieldProps } from "@material-ui/core/TextField/TextField";
import { useEffect, useState } from "react";
import { getMoneroAddresses } from "renderer/rpc";
import { isTestnet } from "store/config";
import { isXmrAddressValid } from "utils/conversionUtils";
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import TruncatedText from "../other/TruncatedText";

type MoneroAddressTextFieldProps = TextFieldProps & {
  address: string;
  onAddressChange: (address: string) => void;
  onAddressValidityChange: (valid: boolean) => void;
  helperText: string;
}

export default function MoneroAddressTextField({
  address,
  onAddressChange,
  onAddressValidityChange,
  helperText,
  ...props
}: MoneroAddressTextFieldProps) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  // Validation
  const placeholder = isTestnet() ? "59McWTPGc745..." : "888tNkZrPN6J...";
  const errorText = isXmrAddressValid(address, isTestnet())
    ? null
    : "Not a valid Monero address";

  // Effects
  useEffect(() => {
    onAddressValidityChange(!errorText);
  }, [address, onAddressValidityChange, errorText]);

  useEffect(() => {
    const fetchAddresses = async () => {
      const response = await getMoneroAddresses();
      setAddresses(response.addresses);
    };
    fetchAddresses();
  }, []);

  // Event handlers
  const handleClose = () => setShowDialog(false);
  const handleAddressSelect = (selectedAddress: string) => {
    onAddressChange(selectedAddress);
    handleClose();
  };

  return (
    <Box>
      <TextField
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        error={!!errorText && address.length > 0}
        helperText={address.length > 0 ? errorText || helperText : helperText}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          endAdornment: addresses?.length > 0 && (
            <IconButton onClick={() => setShowDialog(true)} size="small">
              <ImportContactsIcon />
            </IconButton>
          )
        }}
        {...props}
      />

      <RecentlyUsedAddressesDialog
        open={showDialog}
        onClose={handleClose}
        addresses={addresses}
        onAddressSelect={handleAddressSelect}
      />
    </Box>
  );
}

interface RecentlyUsedAddressesDialogProps {
  open: boolean;
  onClose: () => void;
  addresses: string[];
  onAddressSelect: (address: string) => void;
}

function RecentlyUsedAddressesDialog({
  open,
  onClose,
  addresses,
  onAddressSelect
}: RecentlyUsedAddressesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <List>
          {addresses.map((addr) => (
            <ListItem 
              button 
              key={addr}
              onClick={() => onAddressSelect(addr)}
            >
              <ListItemText 
                primary={
                  <Box fontFamily="monospace">
                    <TruncatedText limit={40} truncateMiddle>
                      {addr}
                    </TruncatedText>
                  </Box>
                }
                secondary="Recently used as a redeem address"
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
