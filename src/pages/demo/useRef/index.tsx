import React, { useRef } from 'react';
import Layout from '@theme/Layout';
import Child, { RefObject } from './Child';

function UseRefDemo() {
  const childRef = useRef<RefObject>({} as RefObject);

  const add = () => {
    childRef.current && childRef.current?.addCount();
  };

  return (
    <>
      <Child ref={childRef} />
      <button onClick={add}>count</button>
    </>
  );
}

export default function UseRefDemoPage() {
  return (
    <Layout title="useRef Hook Demo" description="useRef Hook 演示">
      <div style={{ padding: '2rem' }}>
        <h1>useRef Hook 演示</h1>
        <UseRefDemo />
      </div>
    </Layout>
  );
}
