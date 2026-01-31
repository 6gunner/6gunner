import {
  HtmlClassNameProvider,
  PageMetadata,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import cn from 'clsx';
import BackToTopButton from '@theme/BackToTopButton';
import type { Props } from '@theme/BlogListPage';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';

import { Icon } from '@iconify/react';

import BlogPostGridItems from '../BlogPostGridItems';

import CustomLayout from '../CustomLayout';
import styles from './styles.module.css';
import React from 'react';

type ViewType = 'list' | 'grid';

function BlogListPageMetadata(props: Props): JSX.Element {
  const { metadata } = props;
  const { blogDescription } = metadata;

  return (
    <>
      <PageMetadata title="Blog" description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props) {
  const { metadata, items } = props;
  const { blogTitle, blogDescription } = metadata;

  return (
    <CustomLayout>
      <h2 className={styles.pageTitle}>{blogTitle}</h2>
      {blogDescription && (
        <p className={styles.pageDescription}>{blogDescription}</p>
      )}
      <div className="row">
        <div className="col col--12">
          <BlogPostGridItems items={items} />
          <BlogListPaginator metadata={metadata} />
        </div>
      </div>
      <BackToTopButton />
    </CustomLayout>
  );
}

export default function BlogListPage(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={cn(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
