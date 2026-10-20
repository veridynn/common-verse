import type { CollectionConfig } from "payload";
import { label } from "@poetry/cms-ui";
import { locationSearch, locationReverse } from "../utilities/locations";
import { authenticated } from "./access";
import { coordinateField } from "./locationField";

export const Locations: CollectionConfig = {
  slug: "locations",
  labels: { singular: label("location"), plural: label("locations") },
  admin: {
    useAsTitle: "alias",
    group: label("content"),
    listSearchableFields: ["alias", "address"],
    defaultColumns: ["alias", "address", "coordinates"],
  },
  endpoints: [locationSearch, locationReverse],
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "alias",
      type: "text",
      label: label("location_alias"),
      admin: {
        components: { Label: "./components/LocationField#LocationAliasLabel" },
      },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === "string" ? value.trim() : value),
        ],
      },
    },
    coordinateField(true, false),
    {
      name: "address",
      type: "text",
      label: label("location_address"),
      admin: { hidden: true },
    },
  ],
};
