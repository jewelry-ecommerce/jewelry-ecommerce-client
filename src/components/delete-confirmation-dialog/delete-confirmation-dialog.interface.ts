export interface DeleteConfirmationDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  modalZIndex?: number;
}
