"use client";

import {
  FieldError,
  FieldLabel,
  useField,
  useTranslation,
} from "@payloadcms/ui";
import { message } from "@poetry/cms-ui";
import type { PointFieldClientProps, FieldLabelClientProps } from "payload";
import { Location } from "./Location";
import { validCoordinates } from "../utilities/locations-client";

export function LocationAliasLabel({ path = "alias" }: FieldLabelClientProps) {
  const { i18n } = useTranslation();
  // Payload's TextInput keeps this ID unscoped even inside document drawers.
  return (
    <FieldLabel
      htmlFor={`field-${path.replace(/\./g, "__")}`}
      label={message("location_alias", i18n.language)}
    />
  );
}
export function LocationField({
  path,
  field,
  readOnly,
  bookmarks = true,
}: PointFieldClientProps & { bookmarks?: boolean }) {
  const { i18n, t } = useTranslation();
  const { value, setValue, disabled, showError } = useField<
    [number, number] | null
  >({
    path,
    validate: (value) =>
      (!field.required && value == null) || validCoordinates(value)
        ? true
        : t("validation:requiresTwoNumbers"),
  });
  const parent = path.includes(".")
    ? path.slice(0, path.lastIndexOf(".")) + "."
    : "";
  const address = useField<string>({ path: `${parent}address` });
  const id = `${path}-picker`;
  return (
    <div className="field-type">
      <FieldLabel
        htmlFor={id}
        label={message("location", i18n.language)}
        required={field.required}
      />
      <div id={`${id}-error`}>
        <FieldError path={path} showError={showError} />
      </div>
      <Location
        id={id}
        value={
          validCoordinates(value)
            ? { coordinates: value, address: address.value }
            : null
        }
        disabled={Boolean(readOnly || disabled)}
        showError={showError}
        required={field.required}
        bookmarks={bookmarks}
        onChange={(location) => {
          setValue(location?.coordinates ?? null);
          address.setValue(location?.address ?? "");
        }}
      />
    </div>
  );
}
