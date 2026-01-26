import React from "react";
import Layout from "@theme/Layout";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

function VerticalAlignDemo() {
  const block = {
    width: "100px",
    height: "100px",
    display: "inline-block",
    margin: "5px",
  };

  return (
    <Tabs>
      <TabItem value="1" label="vertical-align: baseline">
        <div style={{ border: "1px solid" }}>
          <div style={{ background: "red", ...block }}></div>
          <div id="green" style={{ background: "green", ...block }}>
            <p>
              hello world <br />
              hello world
            </p>
          </div>
        </div>
      </TabItem>
      <TabItem value="2" label="vertical-align: top">
        <div style={{ border: "1px solid" }}>
          <div style={{ background: "red", ...block }}></div>
          <div
            id="green"
            style={{ background: "green", verticalAlign: "top", ...block }}
          >
            <p>
              hello world <br />
              hello world
            </p>
          </div>
        </div>
      </TabItem>
    </Tabs>
  );
}

export default function VerticalAlignDemoPage() {
  return (
    <Layout title="Vertical Align Demo" description="Vertical Align 演示">
      <div style={{ padding: '2rem' }}>
        <h1>Vertical Align 演示</h1>
        <VerticalAlignDemo />
      </div>
    </Layout>
  );
}
