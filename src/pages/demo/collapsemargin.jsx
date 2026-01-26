import React from "react";
import Layout from "@theme/Layout";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

export const Demo1 = () => {
  return (
    <>
      <div
        style={{
          // display: 'inline-block',
          width: 100,
          height: 100,
          background: "red",
          margin: 20,
        }}
      ></div>
      <div
        style={{ width: 100, height: 100, background: "green", margin: 20 }}
      ></div>
    </>
  );
};

export const Demo2 = () => {
  return (
    <div style={{ background: "gray", margin: 20 }}>
      <div
        style={{
          // display: 'inline-block',
          width: 100,
          height: 100,
          background: "red",
          margin: 20,
          padding: 10,
        }}
      ></div>
      <div
        style={{
          width: 100,
          height: 100,
          background: "green",
          margin: 20,
        }}
      ></div>
    </div>
  );
};

export const Demo3 = () => {
  return (
    <div style={{ background: "gray", margin: 20, overflow: "auto" }}>
      <div
        style={{
          // display: 'inline-block',
          width: 100,
          height: 100,
          background: "red",
          margin: 20,
          padding: 10,
        }}
      ></div>
      <div
        style={{
          width: 100,
          height: 100,
          background: "green",
          margin: 20,
        }}
      ></div>
    </div>
  );
};

export const Demo4 = () => {
  return (
    <div style={{ background: "gray", margin: 20, overflow: "auto" }}>
      <div
        style={{
          // display: 'inline-block',
          width: 100,
          height: 100,
          background: "red",
          margin: 20,
          padding: 10,
          display: "inline-block",
        }}
      ></div>
      <div
        style={{
          width: 100,
          height: 100,
          background: "green",
          margin: 20,
        }}
      ></div>
    </div>
  );
};

export const Demo5 = () => {
  return (
    <Tabs>
      <TabItem value="1" label="vertical-align: baseline">
        <div
          style={{
            width: 100,
            height: 100,
            background: "red",
            margin: 20,
          }}
        ></div>
        <div>
          <div
            style={{
              width: 100,
              height: 100,
              background: "green",
              margin: 20,
            }}
          ></div>
        </div>
      </TabItem>
      <TabItem value="2" label="vertical-align: middle">
        <div
          style={{
            width: 100,
            height: 100,
            background: "red",
            margin: 20,
          }}
        ></div>
        <div style={{ overflow: "auto" }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: "green",
              margin: 20,
            }}
          ></div>
        </div>
      </TabItem>
    </Tabs>
  );
};

export const Demo6 = () => {
  return (
    <div style={{ background: "gray", padding: 20 }}>
      <div
        style={{
          width: 100,
          height: 100,
          background: "red",
        }}
      ></div>
      <div
        style={{
          width: 100,
          height: 100,
          background: "green",
          marginTop: 40,
        }}
      ></div>
    </div>
  );
};

export default function CollapseMarginDemoPage() {
  return (
    <Layout title="Margin折叠Demo" description="CSS Margin折叠演示">
      <div style={{ padding: '2rem' }}>
        <h1>CSS Margin折叠演示</h1>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo1 - 基础Margin折叠</h2>
          <Demo1 />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo2 - 带背景的Margin折叠</h2>
          <Demo2 />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo3 - Overflow Auto</h2>
          <Demo3 />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo4 - Inline Block</h2>
          <Demo4 />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo5 - Vertical Align</h2>
          <Demo5 />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Demo6 - Padding情况</h2>
          <Demo6 />
        </section>
      </div>
    </Layout>
  );
}
