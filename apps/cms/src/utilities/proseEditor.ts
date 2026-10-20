import {
  lexicalEditor,
  ParagraphFeature,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnorderedListFeature,
  OrderedListFeature,
  LinkFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  UnderlineFeature,
  StrikethroughFeature,
  BlockquoteFeature,
  AlignFeature,
  IndentFeature,
  HorizontalRuleFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";

const proseFeatures = [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
  BoldFeature(),
  ItalicFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  LinkFeature({ enabledCollections: [] }),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
];

export const proseEditor = lexicalEditor({ features: proseFeatures });

export const eventEditor = lexicalEditor({
  features: [
    ...proseFeatures,
    UnderlineFeature(),
    StrikethroughFeature(),
    BlockquoteFeature(),
    AlignFeature(),
    IndentFeature(),
    HorizontalRuleFeature(),
    UploadFeature({ enabledCollections: ["media"] }),
  ],
});
