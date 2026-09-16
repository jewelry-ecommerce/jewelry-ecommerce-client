"use client";

import NumberSpinner from "@/components/number-spinner/number-spinner";
import { CartItemData } from "@/utils/api/cart/cart.interface";
import { Box } from "@mui/material";
import { memo, useEffect, useRef, useState, type FocusEvent } from "react";

export interface CartItemQuantityProps {
  id: CartItemData["id"];
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  disableQuantityControl?: boolean;
  onQuantityChange?: CartItemData["onQuantityChange"];
  onRemove?: CartItemData["onRemove"];
  className?: string;
  isMiniCart?: boolean;
}

/**
 * Quantity control shared by cart page and mini cart.
 * Handles typed 0 (confirm remove) and values above max (clamp + remount spinner).
 *
 * Typing only updates local UI. Cart sync happens once on blur/Enter (or immediately for +/-).
 */
export const CartItemQuantity = memo(function CartItemQuantity({
  id,
  quantity,
  minQuantity = 1,
  maxQuantity,
  disableQuantityControl = false,
  onQuantityChange,
  onRemove,
  className,
  isMiniCart = false,
}: CartItemQuantityProps) {
  const [pendingQuantity, setPendingQuantity] = useState(quantity);
  // Remount NumberSpinner when displayed text exceeds max after blur —
  // Base UI keeps the typed text until an external value change remounts it.
  const [spinnerResetKey, setSpinnerResetKey] = useState(0);
  const isTypingRef = useRef(false);
  const lastSyncedRef = useRef(quantity);

  useEffect(() => {
    setPendingQuantity(quantity);
    lastSyncedRef.current = quantity;
  }, [quantity]);

  const clampToMax = (val: number) => (maxQuantity != null ? Math.min(val, maxQuantity) : val);

  const syncQuantity = (next: number) => {
    if (next < minQuantity) return;
    if (next === lastSyncedRef.current) return;
    lastSyncedRef.current = next;
    onQuantityChange?.(id, next);
  };

  // Sync on blur from the raw input text — more reliable than Base UI onValueCommitted
  // with our custom OutlinedInput render (commit often never fires).
  const handleQuantityBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLInputElement;
    if (target?.tagName !== "INPUT") return;

    isTypingRef.current = false;

    // Ignore blur when focus moves to +/- inside the same spinner.
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;

    const rawText = target.value.trim();
    const typedValue = Number.parseInt(rawText, 10);

    // Empty or unparsable: restore current quantity display.
    if (rawText === "" || Number.isNaN(typedValue)) {
      setPendingQuantity(quantity);
      setSpinnerResetKey((key) => key + 1);
      return;
    }

    // All zeros / below min → treat as remove intent; restore display in case user cancels.
    if (typedValue < minQuantity) {
      setPendingQuantity(quantity);
      setSpinnerResetKey((key) => key + 1);
      onRemove?.(id);
      return;
    }

    const clamped = clampToMax(typedValue);
    setPendingQuantity(clamped);
    if (clamped !== typedValue) {
      setSpinnerResetKey((key) => key + 1);
    }
    syncQuantity(clamped);
  };

  const handleQuantityFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement)?.tagName === "INPUT") {
      isTypingRef.current = true;
    }
  };

  return (
    <Box className={className} onFocusCapture={handleQuantityFocusCapture} onBlurCapture={handleQuantityBlurCapture}>
      <NumberSpinner
        key={spinnerResetKey}
        min={0}
        max={maxQuantity}
        disabled={disableQuantityControl}
        value={pendingQuantity}
        size="small"
        onValueChange={(val: number | null) => {
          if (val == null) return;
          const next = clampToMax(val);
          setPendingQuantity(next);

          // Typing: local only. +/- (input not focused): sync immediately.
          if (!isTypingRef.current) {
            syncQuantity(next);
          }
        }}
        onValueCommitted={(val: number | null) => {
          // Backup path (Enter / native commit). blurCapture usually handles sync first;
          // lastSyncedRef prevents duplicate cart calls.
          if (val == null) return;

          if (val < minQuantity) {
            setPendingQuantity(quantity);
            onRemove?.(id);
            return;
          }

          const clamped = clampToMax(val);
          setPendingQuantity(clamped);
          syncQuantity(clamped);

          if (clamped !== val) {
            setSpinnerResetKey((key) => key + 1);
          }
        }}
        isMiniCart={isMiniCart}
      />
    </Box>
  );
});
