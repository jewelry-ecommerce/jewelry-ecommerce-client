"use client";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import TextFieldComponent from "@/components/text-field/text-field.component";
export function JavaAddressFields<T extends FieldValues>({ control, disabled = false }: { control: Control<T>; disabled?: boolean }) {
  return <>{(["provinceName", "wardName"] as const).map(name => (
    <Controller key={name} name={name as Path<T>} control={control} render={({ field, fieldState }) => (
      <TextFieldComponent name={field.name} value={String(field.value ?? "")} onBlur={field.onBlur}
        onValueChange={field.onChange} label={name === "provinceName" ? "Tỉnh/Thành phố" : "Phường/Xã"}
        required disabled={disabled} error={fieldState.error?.message} />
    )} />
  ))}</>;
}
