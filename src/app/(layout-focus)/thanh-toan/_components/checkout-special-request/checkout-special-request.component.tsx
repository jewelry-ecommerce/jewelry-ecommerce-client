import React, { useEffect } from "react";
import { Box, Stack, TextField } from "@mui/material";
import { useFormContext, Controller, useFormState } from "react-hook-form";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import useStyles, { getOtherCheckboxStyles, getVatCheckboxStyles } from "./checkout-special-request.styles";
import { CheckoutFormValues } from "../checkout.constant";

export interface CheckoutSpecialRequestSectionProps {
  showVatSection?: boolean;
  onVatSectionToggle?: (val: boolean) => void;
  showNoteSection?: boolean;
  onNoteSectionToggle?: (val: boolean) => void;
  readOnly?: boolean;
}

const CheckoutSpecialRequestSection: React.FC<CheckoutSpecialRequestSectionProps> = ({
  showVatSection = false,
  onVatSectionToggle,
  showNoteSection = false,
  onNoteSectionToggle,
  readOnly = false,
}) => {
  const { classes } = useStyles();
  const { control } = useFormContext<CheckoutFormValues>();
  const { submitCount } = useFormState({ control });

  const vatToggleSubmitCount = React.useRef(submitCount);
  const noteToggleSubmitCount = React.useRef(submitCount);

  useEffect(() => {
    if (showVatSection) vatToggleSubmitCount.current = submitCount;
  }, [showVatSection, submitCount]);

  useEffect(() => {
    if (showNoteSection) noteToggleSubmitCount.current = submitCount;
  }, [showNoteSection, submitCount]);

  return (
    <Box className={classes.root}>
      <CheckoutSectionHeaderComponent title="YÊU CẦU ĐẶC BIỆT" />
      <Stack className={classes.sectionWrapper}>
        <Stack className={classes.sectionWrapper}>
          <CheckboxComponent
            title="Thông tin xuất hoá đơn VAT"
            checked={showVatSection}
            onChange={readOnly ? undefined : onVatSectionToggle}
            sxCheckbox={getVatCheckboxStyles(showVatSection, readOnly)}
            sx={{ cursor: readOnly ? "default" : "pointer" }}
          />
          {showVatSection && (
            <Stack className={classes.vatFieldsWrapper}>
              <Controller
                name="companyName"
                control={control}
                render={({ field, fieldState }) => {
                  const showErr = fieldState.isTouched || submitCount > vatToggleSubmitCount.current;
                  return (
                    <TextFieldComponent
                      {...field}
                      label="Tên công ty"
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      error={showErr ? (fieldState.error?.message as string) : undefined}
                    />
                  );
                }}
              />
              <Controller
                name="companyAddress"
                control={control}
                render={({ field, fieldState }) => {
                  const showErr = fieldState.isTouched || submitCount > vatToggleSubmitCount.current;
                  return (
                    <TextFieldComponent
                      {...field}
                      label="Địa chỉ công ty"
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      error={showErr ? (fieldState.error?.message as string) : undefined}
                    />
                  );
                }}
              />
              <Controller
                name="taxCode"
                control={control}
                render={({ field, fieldState }) => {
                  const showErr = fieldState.isTouched || submitCount > vatToggleSubmitCount.current;
                  return (
                    <TextFieldComponent
                      {...field}
                      label="Mã số thuế"
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      error={showErr ? (fieldState.error?.message as string) : undefined}
                    />
                  );
                }}
              />
              <Controller
                name="vatEmail"
                control={control}
                render={({ field, fieldState }) => {
                  const showErr = fieldState.isTouched || submitCount > vatToggleSubmitCount.current;
                  return (
                    <TextFieldComponent
                      {...field}
                      label="Email"
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      error={showErr ? (fieldState.error?.message as string) : undefined}
                    />
                  );
                }}
              />
            </Stack>
          )}
        </Stack>

        <Stack spacing={2}>
          <CheckboxComponent
            title="Yêu cầu khác"
            checked={showNoteSection}
            onChange={readOnly ? undefined : onNoteSectionToggle}
            sxCheckbox={getOtherCheckboxStyles(showNoteSection, readOnly)}
            sxLabel={TYPOGRAPHY_STYLES.base.regular}
            sx={{ cursor: readOnly ? "default" : "pointer" }}
          />
          {showNoteSection && (
            <Box className={classes.otherNoteWrapper}>
              <Controller
                name="note"
                control={control}
                render={({ field, fieldState }) => {
                  const showErr = fieldState.isTouched || submitCount > noteToggleSubmitCount.current;
                  return (
                    <TextField
                      {...field}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Yêu cầu khác"
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={classes.textarea}
                      disabled={readOnly}
                      error={showErr && !!fieldState.error}
                      helperText={showErr ? (fieldState.error?.message as string) : ""}
                    />
                  );
                }}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CheckoutSpecialRequestSection;
