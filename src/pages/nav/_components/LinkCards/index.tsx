import React from 'react';
import { NavCategory } from '@site/src/data/nav/type';
import LinkCard from '../LinkCard';
import styles from './style.module.css';

interface LinkCardsProps {
  data: NavCategory;
}
function LinkCards(props: LinkCardsProps) {
  const { data } = props;

  return (
    <div className={styles.category}>
      <h2 id={data.category.toLowerCase().replace(/\s+/g, '-')}>
        {data.category}
      </h2>
      <div className={styles.categoryGrid}>
        {data.items.map((item) => (
          <LinkCard data={item} key={item.title} />
        ))}
      </div>
    </div>
  );
}
export default LinkCards;
