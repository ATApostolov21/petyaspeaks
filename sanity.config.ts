import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { projectId, dataset, apiVersion } from "./sanity/env";

export default defineConfig({
  name: "default",
  title: "Petya Speaks",

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Съдържание")
          .items([
            S.listItem()
              .title("Авторка")
              .id("author")
              .child(
                S.document().schemaType("author").documentId("author"),
              ),
            S.divider(),
            S.listItem()
              .title("Поръчки")
              .schemaType("order")
              .child(
                S.documentTypeList("order")
                  .title("Поръчки")
                  .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== "author" && item.getId() !== "order",
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
});
