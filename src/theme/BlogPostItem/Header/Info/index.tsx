import { translate } from '@docusaurus/Translate';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { usePluralForm } from '@docusaurus/theme-common';
import { useDateTimeFormat } from '@docusaurus/theme-common/internal';
import cn from 'clsx';
import type { Props } from '@theme/BlogPostItem/Header/Info';

import { Icon } from '@iconify/react';
import Tag from '@site/src/components/Tag';
import React from 'react';

import styles from './styles.module.css';

// Very simple pluralization: probably good enough for now
function useReadingTimePlural() {
  const { selectMessage } = usePluralForm();
  return (readingTimeFloat: number) => {
    const readingTime = Math.ceil(readingTimeFloat);
    return selectMessage(
      readingTime,
      translate(
        {
          id: 'theme.blog.post.readingTime.plurals',
          description:
            'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One min read|{readingTime} min read',
        },
        { readingTime }
      )
    );
  };
}

export function ReadingTime({ readingTime }: { readingTime: number }) {
  const readingTimePlural = useReadingTimePlural();
  return <span className={styles.truncate}>{readingTimePlural(readingTime)}</span>;
}

function DateTime({
  date,
  formattedDate,
}: {
  date: string;
  formattedDate: string;
}) {
  return (
    <time dateTime={date} itemProp="datePublished" className={styles.truncate}>
      {formattedDate}
    </time>
  );
}

export default function BlogPostItemHeaderInfo({
  className,
}: Props): JSX.Element {
  const { metadata } = useBlogPost();
  const { date, tags, readingTime } = metadata;

  const tagsExists = tags.length > 0;

  const dateTimeFormat = useDateTimeFormat({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const formatDate = (blogDate: string) =>
    dateTimeFormat.format(new Date(blogDate));

  return (
    <div
      className={cn(
        styles.headerInfo,
        'margin-bottom--md',
        className
      )}
    >
      <div className={styles.infoItem}>
        <Icon icon="ri:calendar-line" />
        <DateTime date={date} formattedDate={formatDate(date)} />
      </div>
      {tagsExists && (
        <div className={styles.infoItem}>
          <Icon icon="ri:price-tag-3-line" />
          <div className={cn(styles.truncate, styles.tagsContainer)}>
            {tags
              .slice(0, 3)
              .map(({ label, description, permalink: tagPermalink }, index) => {
                return (
                  <div key={tagPermalink}>
                    {index !== 0 && '/'}
                    <Tag
                      label={label}
                      permalink={tagPermalink}
                      className={styles.tag}
                      description={description}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {typeof readingTime !== 'undefined' && (
        <div className={styles.infoItem}>
          <Icon icon="ri:time-line" />
          <ReadingTime readingTime={readingTime} />
        </div>
      )}
    </div>
  );
}
