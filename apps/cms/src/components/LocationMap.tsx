"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { LocationValue } from "../utilities/locations";
import styles from "./Location.module.css";

type Point = LocationValue;

export function LocationMap({
  point,
  disabled,
  onSelect,
  label,
  errorLabel,
}: {
  point: Point | null;
  disabled: boolean;
  onSelect: (point: Point) => void;
  label: string;
  errorLabel: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const latest = useRef({ point, disabled, onSelect });
  latest.current = { point, disabled, onSelect };
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let instance: LeafletMap | undefined;
    import("leaflet")
      .then((L) => {
        if (cancelled || !container.current) return;
        const initial = latest.current.point;
        instance = L.map(container.current, {
          scrollWheelZoom: false,
          zoomControl: false,
        });
        map.current = instance;
        instance.setView(
          initial
            ? [initial.coordinates[1], initial.coordinates[0]]
            : [52.52, 13.405],
          initial ? 14 : 12,
        );
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
          .on("tileerror", () => setFailed(true))
          .addTo(instance);
        marker.current = L.marker(
          initial
            ? [initial.coordinates[1], initial.coordinates[0]]
            : [52.52, 13.405],
          {
            draggable: !latest.current.disabled,
            keyboard: false,
            icon: L.icon({
              iconUrl:
                typeof markerIcon === "string" ? markerIcon : markerIcon.src,
              iconRetinaUrl:
                typeof markerIcon2x === "string"
                  ? markerIcon2x
                  : markerIcon2x.src,
              shadowUrl:
                typeof markerShadow === "string"
                  ? markerShadow
                  : markerShadow.src,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              shadowSize: [41, 41],
            }),
          },
        );
        if (initial) marker.current.addTo(instance);
        marker.current.on("dragend", () => {
          if (latest.current.disabled) return;
          const position = marker.current!.getLatLng().wrap();
          latest.current.onSelect({
            coordinates: [position.lng, position.lat],
          });
        });
        instance.on("click", ({ latlng }) => {
          if (!latest.current.disabled)
            latest.current.onSelect({
              coordinates: [latlng.wrap().lng, latlng.lat],
            });
        });
        observer = new ResizeObserver(() => instance?.invalidateSize());
        observer.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      instance?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current) return;
    if (point) {
      marker.current
        .setLatLng([point.coordinates[1], point.coordinates[0]])
        .addTo(map.current);
      map.current.setView(
        [point.coordinates[1], point.coordinates[0]],
        Math.max(map.current.getZoom(), 14),
      );
    } else marker.current.remove();
  }, [point?.coordinates[0], point?.coordinates[1], ready]);

  useEffect(() => {
    if (disabled) marker.current?.dragging?.disable();
    else marker.current?.dragging?.enable();
  }, [disabled, ready]);

  return (
    <>
      <div
        ref={container}
        className={styles.map}
        role="region"
        aria-label={label}
      />
      {failed && (
        <p role="alert" className={styles.error}>
          {errorLabel}
        </p>
      )}
    </>
  );
}
