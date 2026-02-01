'use client';

import React, { useEffect, useRef } from 'react';
import { useHistory } from '@docusaurus/router';

export default function Home() {
  const history = useHistory();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    // 视频播放完成后跳转
    const handleVideoEnded = () => {
      history.replace('/nav');
    };

    if (video) {
      // 监听视频播放结束事件
      video.addEventListener('ended', handleVideoEnded);

      // 自动播放视频
      video.play().catch((error) => {
        console.error('视频自动播放失败:', error);
      });
    }

    // 清理事件监听
    return () => {
      if (video) {
        video.removeEventListener('ended', handleVideoEnded);
      }
    };
  }, [history]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        src="/videos/intro.mp4"
        muted
        playsInline
        autoPlay
      />
    </div>
  );
}
