import type { Access, PayloadRequest } from "payload";

export const isAdministrator = (req: PayloadRequest): boolean =>
  req.user?.collection === "users" && req.user.role === "admin";

export const isEditor = (req: PayloadRequest): boolean =>
  req.user?.collection === "users" &&
  (req.user.role === "admin" || req.user.role === "editor");

export const administrator: Access = ({ req }) => isAdministrator(req);
export const authenticated: Access = ({ req }) => isEditor(req);

export const administratorOrSelf: Access = ({ req }) => {
  if (isAdministrator(req)) return true;
  if (!isEditor(req)) return false;
  return { id: { equals: req.user!.id } };
};

export const administratorOrEditors: Access = ({ req }) => {
  if (isAdministrator(req)) return true;
  if (!isEditor(req)) return false;
  return { role: { equals: "editor" } };
};

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (isEditor(req)) return true;
  return { _status: { equals: "published" } };
};
