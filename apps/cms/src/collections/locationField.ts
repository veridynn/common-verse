import type { GroupField, PointField } from "payload";
import { label } from "@poetry/cms-ui";
import { validCoordinates } from "../utilities/locations-client";

export function coordinateField(
  required = false,
  bookmarks = true,
): PointField {
  return {
    name: "coordinates",
    type: "point",
    required,
    label: label("coordinates"),
    validate: (value, { req }) =>
      (!required && value == null) || validCoordinates(value)
        ? true
        : req.t("validation:requiresTwoNumbers"),
    admin: {
      components: {
        Field: {
          path: "./components/LocationField#LocationField",
          clientProps: { bookmarks },
        },
      },
    },
  };
}
export function eventLocationField(): GroupField {
  return {
    name: "location",
    type: "group",
    label: false,
    admin: { hideGutter: true, className: "event-editor-location" },
    fields: [
      coordinateField(),
      {
        name: "address",
        type: "text",
        label: label("location_address"),
        admin: { hidden: true },
      },
    ],
  };
}
