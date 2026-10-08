"use client";

import { useForm, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

const labels: Record<string, string> = {
  introduction: "Project introduction",
  poets: "Featured poets",
  events: "Upcoming events and workshops",
  participation: "Take part",
  newsletter: "Newsletter",
};

/** A keyboard and single-click alternative to dragging Payload's section blocks. */
export function HomepageOutline() {
  const rows = useFormFields(([fields]) => fields.sections?.rows ?? []);
  const { moveFieldRow, disabled } = useForm();
  const [notice, setNotice] = useState("");
  const move = (index: number, destination: number, name: string) => {
    moveFieldRow({
      path: "sections",
      moveFromIndex: index,
      moveToIndex: destination,
    });
    setNotice(`${name} moved to position ${destination + 1}.`);
  };
  return (
    <section
      aria-label="Homepage section order"
      style={{
        marginBlock: "2rem",
        padding: "1.25rem",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginBlock: "0 0.5rem" }}>Page order</h2>
      <p>
        Move sections here, then expand their fields below to edit. Open Live
        Preview to see your changes after autosave. Publishing makes them
        public.
      </p>
      <ol style={{ paddingInlineStart: "1.5rem" }}>
        {rows.map((row, index) => {
          const label = labels[row.blockType ?? ""] ?? "Section";
          return (
            <li key={row.id} style={{ paddingBlock: "0.5rem" }}>
              <span>{label}</span>{" "}
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => move(index, index - 1, label)}
                aria-label={`Move ${label} up`}
                style={{ minHeight: "44px", marginInlineStart: "0.5rem" }}
              >
                Move up
              </button>{" "}
              <button
                type="button"
                disabled={disabled || index === rows.length - 1}
                onClick={() => move(index, index + 1, label)}
                aria-label={`Move ${label} down`}
                style={{ minHeight: "44px" }}
              >
                Move down
              </button>
            </li>
          );
        })}
      </ol>
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </section>
  );
}
