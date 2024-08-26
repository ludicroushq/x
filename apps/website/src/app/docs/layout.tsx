import { DocsLayout } from 'fumadocs-ui/layout';
import { pageTree } from '@/app/source';
import type { ReactNode } from 'react';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={pageTree} >
      {children}
    </DocsLayout>
  );
}
