"use client";

import { getTranslation } from "@payloadcms/translations";
import {
  FieldError,
  FieldLabel,
  ReactSelect,
  useField,
  useTranslation,
} from "@payloadcms/ui";
import type { SelectFieldClientProps } from "payload";

export function RoleField({ field, path, readOnly }: SelectFieldClientProps) {
  const { i18n } = useTranslation();
  const { value, setValue, disabled, showError, selectFilterOptions } =
    useField<string>({ path });
  const options = field.options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : { label: getTranslation(option.label, i18n), value: option.value },
  );

  return (
    <div className="field-type select">
      <FieldLabel label={field.label} path={path} required={field.required} />
      <FieldError path={path} showError={showError} />
      <ReactSelect
        inputId={`field-${path}`}
        options={options}
        value={options.find((option) => option.value === value)}
        disabled={readOnly || disabled}
        isSearchable={false}
        isClearable={false}
        showError={showError}
        filterOption={
          selectFilterOptions
            ? ({ value: optionValue }) =>
                selectFilterOptions.some(
                  (option) =>
                    (typeof option === "string" ? option : option.value) ===
                    optionValue,
                )
            : undefined
        }
        onChange={(option) => {
          if (!readOnly && !disabled && !Array.isArray(option))
            setValue(option.value);
        }}
      />
    </div>
  );
}
