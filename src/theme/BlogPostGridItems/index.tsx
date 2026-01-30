import Link from '@docusaurus/Link';
import type { BlogPostFrontMatter } from '@docusaurus/plugin-content-blog';
import cn from 'clsx';
import Tag from '@site/src/components/Tag';
import type { Props as BlogPostItemsProps } from '@theme/BlogPostItems';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import styles from './styles.module.css';
import React from 'react';

export default function BlogPostGridItems({
  items,
}: BlogPostItemsProps): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = items.map(({ content: BlogPostContent }) => {
    const { metadata, frontMatter } = BlogPostContent;
    const { title, sticky } = frontMatter as BlogPostFrontMatter & {
      sticky: number;
    };
    const { permalink, date, tags } = metadata;
    const dateObj = new Date(date);
    const dateString = `${dateObj.getFullYear()}-${`0${dateObj.getMonth() + 1}`.slice(
      -2
    )}-${`0${dateObj.getDate()}`.slice(-2)}`;

    return {
      title,
      link: permalink,
      tags,
      date: dateString,
      sticky,
    };
  });

  return (
    <div className={styles.gridContainer}>
      {data.map((item, idx) => (
        <div
          key={item.link}
          className={styles.gridItem}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Link href={item.link} className={styles.cardLink}>
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className={styles.hoverBackground}
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>

            <Card
              className={cn(
                styles.card,
                item.sticky && styles.blogSticky
              )}
            >
              <CardTitle className={styles.cardTitle}>
                {item.title}
              </CardTitle>
              <CardFooter className={styles.cardFooter}>
                <div className={styles.blogTags}>
                  {item.tags?.length > 0 && (
                    <>
                      <svg width="1em" height="1em" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M10 15h4V9h-4v6Zm0 2v3a1 1 0 0 1-2 0v-3H5a1 1 0 0 1 0-2h3V9H5a1 1 0 1 1 0-2h3V4a1 1 0 1 1 2 0v3h4V4a1 1 0 0 1 2 0v3h3a1 1 0 0 1 0 2h-3v6h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3h-4Z"
                        />
                      </svg>
                      {item.tags
                        .slice(0, 3)
                        .map(
                          (
                            { label, permalink: tagPermalink, description },
                            index
                          ) => (
                            <>
                              {index !== 0 && '/'}
                              <Tag
                                label={label}
                                description={description}
                                permalink={tagPermalink}
                                key={tagPermalink}
                                className="tag"
                              />
                            </>
                          )
                        )}
                    </>
                  )}
                </div>
                <div className={styles.dateText}>
                  {item.date}
                </div>
              </CardFooter>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  );
}

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        styles.cardContent,
        className
      )}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardBody}>{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <h4 className={cn(styles.cardTitle, className)}>{children}</h4>;
};

export const CardFooter = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return <div className={className}>{children}</div>;
};
