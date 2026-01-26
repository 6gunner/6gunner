import React from 'react';
import styles from './style.module.css';
import Link from '@docusaurus/Link';

import { NavData } from '@site/src/data/nav/type';
interface LinkCardProps {
  data: NavData;
}
function LinkCard(props: LinkCardProps) {
  const { data } = props;

  return (
    <Link
      className={styles.navLink}
      href={data.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <div className={styles.icon}>
            <img src={data.icon} alt={data.title} />
          </div>
          <h5 className={styles.title}>{data.title}</h5>
        </div>
        {data.desc && <p className={styles.desc}>{data.desc}</p>}
      </div>
    </Link>
  );
}
export default LinkCard;
