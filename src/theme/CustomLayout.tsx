import { PageMetadata } from '@docusaurus/theme-common';
import cn from 'clsx';
import type { Props } from '@theme/Layout';
import Layout from '@theme/Layout';
import React from 'react';

import styles from './styles.module.css';

export default function CustomLayout({
  children,
  maxWidth,
  ...layoutProps
}: Props & { maxWidth?: number }): JSX.Element {
  return (
    <Layout {...layoutProps}>
      <PageMetadata
        title={layoutProps.title}
        description={layoutProps.description}
      />

      <div className={styles.background}>
        <div
          className={cn(styles.container, 'margin-vert--lg')}
          style={maxWidth ? { maxWidth: `${maxWidth}px` } : {}}
        >
          <main>{children}</main>
        </div>
      </div>
    </Layout>
  );
}
