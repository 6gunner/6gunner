import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import cn from 'clsx';
import type { Props } from '@theme/BlogPostItem/Container';
import React from 'react';

import styles from './styles.module.css';

export default function BlogPostItemContainer({
  children,
  className,
}: Props): JSX.Element {
  const { frontMatter, assets } = useBlogPost();
  const { withBaseUrl } = useBaseUrlUtils();
  const image = assets.image ?? frontMatter.image;
  return (
    <article
      className={cn(styles.container, className)}
      itemProp="blogPost"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      {image && (
        <>
          <meta
            itemProp="image"
            content={withBaseUrl(image, { absolute: true })}
          />
          <div className={styles.imageOverlay}>
            <div
              className={styles.imageBackground}
              style={{
                WebkitMaskImage:
                  'linear-gradient(180deg, #fff -17.19%, #00000000 92.43%)',
                maskImage:
                  'linear-gradient(180deg, #fff -17.19%, #00000000 92.43%)',
                backgroundImage: `url("${image}")`,
              }}
            />
          </div>
          <div style={{ height: '120px' }} />
        </>
      )}
      {children}
    </article>
  );
}
