"use client";

import { TextFieldComponent } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import { AI_BUDGET_MAX, AI_BUDGET_MIN, AI_BUDGET_STEP, AI_OCCASIONS, AI_STYLES } from "@/utils/api/ai/ai.constant";
import type { AiPreferenceValues } from "@/utils/api/ai/ai.interface";
import { formatPrice } from "@/utils/constants/common.constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Checkbox, FormControlLabel, MenuItem, Select, Slider, Stack, Typography } from "@mui/material";
import { Controller, useForm, type Control } from "react-hook-form";
import { AI_PREFERENCE_DEFAULTS, aiPreferenceSchema } from "./ai-preference.schema";

type AiPreferenceFormProps = {
  initialValues?: AiPreferenceValues;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: AiPreferenceValues) => void;
};

const toggleStyle = (current: string[], style: string) =>
  current.includes(style) ? current.filter((item) => item !== style) : [...current, style];

const OccasionField = ({ control }: { control: Control<AiPreferenceValues> }) => (
  <Controller
    name="occasion"
    control={control}
    render={({ field, fieldState }) => (
      <Stack sx={{ gap: "8px" }}>
        <Typography>Dịp</Typography>
        <Select value={field.value} onChange={(event) => field.onChange(String(event.target.value))} displayEmpty sx={{ height: 50 }}>
          <MenuItem value="">Chọn dịp</MenuItem>
          {AI_OCCASIONS.map((occasion) => <MenuItem key={occasion} value={occasion}>{occasion}</MenuItem>)}
        </Select>
        {fieldState.error ? <Typography color="error">{fieldState.error.message}</Typography> : null}
      </Stack>
    )}
  />
);

const StyleField = ({ control }: { control: Control<AiPreferenceValues> }) => (
  <Controller
    name="styles"
    control={control}
    render={({ field }) => (
      <Stack>
        <Typography>Phong cách</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {AI_STYLES.map((style) => (
            <FormControlLabel
              key={style}
              control={<Checkbox checked={field.value.includes(style)} onChange={() => field.onChange(toggleStyle(field.value, style))} />}
              label={style}
            />
          ))}
        </Box>
      </Stack>
    )}
  />
);

const BudgetField = ({ control }: { control: Control<AiPreferenceValues> }) => (
  <Controller
    name="budget"
    control={control}
    render={({ field, fieldState }) => (
      <Stack sx={{ gap: "8px" }}>
        <Typography>Ngân sách: {formatPrice(field.value || AI_BUDGET_MIN)}</Typography>
        <Slider
          min={AI_BUDGET_MIN}
          max={AI_BUDGET_MAX}
          step={AI_BUDGET_STEP}
          value={field.value || AI_BUDGET_MIN}
          onChange={(_event, value) => field.onChange(Array.isArray(value) ? value[0] : value)}
        />
        <TextFieldComponent
          label="Ngân sách (đ)"
          type="number"
          value={String(field.value || "")}
          onValueChange={(next) => field.onChange(next.trim() ? Number(next) : AI_BUDGET_MIN)}
          error={fieldState.error?.message}
        />
      </Stack>
    )}
  />
);

const AiPreferenceForm = ({ initialValues, submitLabel, submitting, onSubmit }: AiPreferenceFormProps) => {
  const { control, handleSubmit } = useForm<AiPreferenceValues>({
    resolver: zodResolver(aiPreferenceSchema),
    defaultValues: initialValues ?? AI_PREFERENCE_DEFAULTS,
  });

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} sx={{ gap: "20px", maxWidth: 720 }}>
      <OccasionField control={control} />
      <StyleField control={control} />
      <BudgetField control={control} />
      <Controller
        name="recipient"
        control={control}
        render={({ field, fieldState }) => (
          <TextFieldComponent label="Người nhận (không bắt buộc)" value={field.value} onValueChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <ButtonComponent type="submit" content={submitLabel} loading={submitting} disabled={submitting} />
    </Stack>
  );
};

export default AiPreferenceForm;
