import { FieldHook } from "payload";

export const slugify: FieldHook = async ({ data }) => {
  const slug = data?.name.toLowerCase().replace(/ /g, '-');
  return slug;
}
