import React, { useState } from "react";

/**
 * 这是一个示例Demo组件
 * 可以在MDX文档中通过 import ExampleDemo from '@/demo/ExampleDemo'; 引入使用
 */
export default function ExampleDemo() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #4CAF50",
        borderRadius: "8px",
        textAlign: "center",
        maxWidth: "400px",
        margin: "20px auto",
      }}
    >
      <h3 style={{ color: "#4CAF50" }}>计数器示例</h3>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{count}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={() => setCount(count - 1)}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#ff5722",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          -1
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#607D8B",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          重置
        </button>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          +1
        </button>
      </div>
    </div>
  );
}
