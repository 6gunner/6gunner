import React from "react";
import Layout from "@theme/Layout";

function ScrollTopDemo() {
  const containerDom = React.useRef();

  const handleChange = (e) => {
    if (containerDom.current) {
      containerDom.current.scrollTop = e.target.value;
    }
  };

  return (
    <div>
      <div>
        <input type="range" min="0" max="600" onChange={handleChange} />
      </div>
      <div
        ref={containerDom}
        style={{
          width: "100%",
          height: "300px",
          overflow: "auto",
          background: "green",
        }}
      >
        <div
          style={{
            height: "800px",
            width: "300px",
            background: "red",
            marginTop: 50,
          }}
        ></div>
      </div>
    </div>
  );
}

export default function ScrollTopDemoPage() {
  return (
    <Layout title="ScrollTop Demo" description="ScrollTop 演示">
      <div style={{ padding: '2rem' }}>
        <h1>ScrollTop 演示</h1>
        <ScrollTopDemo />
      </div>
    </Layout>
  );
}
