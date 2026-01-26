import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@site/src/components/CodeBlock';

function UseIntervalDemo() {
  const intervalRef = useRef<number>();
  const saveCallback = useRef<() => void>();
  const [count, setCount] = useState(1);

  function startCount() {
    setCount(count + 1);
  }

  useEffect(() => {
    saveCallback.current = startCount;
  });

  useEffect(() => {
    function tick() {
      saveCallback.current!();
    }

    intervalRef.current = window.setInterval(tick, 1000);
  }, []);

  const cancel = () => {
    setCount(0);
    window.clearInterval(intervalRef.current);
    // window.clearInterval(id);
  };

  return (
    <CodeBlock>
      <div style={{ margin: 'auto', textAlign: 'center' }}>
        <h1>{count}</h1>
        <button onClick={cancel}>取消</button>
      </div>
    </CodeBlock>
  );
}

export default function UseIntervalDemoPage() {
  return (
    <Layout title="useInterval Hook Demo" description="useInterval Hook 演示">
      <div style={{ padding: '2rem' }}>
        <h1>useInterval Hook 演示</h1>
        <UseIntervalDemo />
      </div>
    </Layout>
  );
}
