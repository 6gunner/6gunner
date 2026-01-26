import React from "react";
import Layout from "@theme/Layout";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

function VerticalAlignDemo2() {
  return (
    <Tabs>
      <TabItem value="1" label="vertical-align: baseline">
        <div style={{ background: "gray" }}>
          <img
            src="/img/redfat.png"
            style={{
              height: 100,
              border: "1px solid",
            }}
          />
        </div>
      </TabItem>
      <TabItem value="2" label="vertical-align: middle">
        <div style={{ background: "gray" }}>
          <img
            src="/img/redfat.png"
            style={{
              height: 100,
              verticalAlign: "middle",
              border: "1px solid",
            }}
          />
        </div>
      </TabItem>
    </Tabs>
  );
}

export default function VerticalAlignDemo2Page() {
  return (
    <Layout title="Vertical Align Demo 2" description="Vertical Align 演示 2">
      <div style={{ padding: '2rem' }}>
        <h1>Vertical Align 演示 2</h1>
        <VerticalAlignDemo2 />
      </div>
    </Layout>
  );
}
