import type { ContentBlockData } from './types';
import type { PhrasingContent } from 'mdast';

declare module 'mdast' {
  interface BlockContentMap {
    contentBlock: ContentBlock;
    underline: Underline;
    descriptionlist: DescriptionList;
    descriptionterm: DescriptionTerm;
    descriptiondetails: DescriptionDetails;
  }
  interface PhrasingContentMap {
    underline: Underline;
  }
}

interface DescriptionList {
  type: 'descriptionlist';
  data?: { irId?: string; hName?: string; hProperties?: Record<string, unknown> };
  children: Array<DescriptionTerm | DescriptionDetails | import('mdast').RootContent>;
}

interface DescriptionTerm {
  type: 'descriptionterm';
  data?: { irId?: string; hName?: string; hProperties?: Record<string, unknown> };
  children: PhrasingContent[];
}

interface DescriptionDetails {
  type: 'descriptiondetails';
  data?: { irId?: string; hName?: string; hProperties?: Record<string, unknown> };
  children: import('mdast').RootContent[];
}

interface ContentBlock {
  type: 'contentBlock';
  data?: {
    irId?: string;
    block?: ContentBlockData;
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children: import('mdast').RootContent[];
}

interface Underline {
  type: 'underline';
  data?: { hName?: string };
  children: import('mdast').PhrasingContent[];
}
