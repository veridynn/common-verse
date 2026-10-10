"use client";

import { getTranslation } from "@payloadcms/translations";
import { useConfig, useTranslation } from "@payloadcms/ui";
import { useEffect } from "react";

export function CollectionLabels() {
  const { config, setConfig } = useConfig();
  const { i18n } = useTranslation();
  useEffect(() => {
    // Payload 3.90's drawer ARIA label interpolates the label object directly.
    if (
      config.collections.some(
        (collection) => typeof collection.labels.singular !== "string",
      )
    ) {
      setConfig({
        ...config,
        collections: config.collections.map((collection) => ({
          ...collection,
          labels: {
            singular: getTranslation(collection.labels.singular, i18n),
            plural: getTranslation(collection.labels.plural, i18n),
          },
        })),
      });
    }
  }, [config, setConfig, i18n]);
  return null;
}
