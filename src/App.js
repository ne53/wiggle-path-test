import React, { useEffect, useState } from "react";
import { ReactComponent as AssetSvg } from "./asset.svg";
import { Form } from "react-bootstrap"; // Form.Range を使用するためにインポート

const random = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateWigglePoints = (path, pointCount, seed, amplitude) => {
  const points = [];
  const length = path.getTotalLength();

  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;
    const { x, y } = path.getPointAtLength(t * length);

    points.push({
      x,
      y,
      offsetX: random(seed + i) * amplitude - amplitude / 2, // 揺れ幅を制御
      offsetY: random(seed + i + 1) * amplitude - amplitude / 2, // 揺れ幅を制御
    });
  }

  return points;
};

const smoothPath = (points) => {
  if (points.length < 2) return "";

  const path = [`M ${points[0].x},${points[0].y}`];

  // 中間点での滑らかな補完
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];

    const controlX = (curr.x + next.x) / 2;
    const controlY = (curr.y + next.y) / 2;

    path.push(`Q ${curr.x},${curr.y} ${controlX},${controlY}`);
  }

  // 最後の点の補完
  const last = points[points.length - 1];
  const first = points[0]; // 最初の点を使って補完

  const controlX = (last.x + first.x) / 2;
  const controlY = (last.y + first.y) / 2;

  // 最後に始点と終点を滑らかに繋げる
  path.push(`Q ${last.x},${last.y} ${controlX},${controlY}`);
  path.push(`T ${first.x},${first.y}`);

  return path.join(" ");
};

const WigglePath = ({ d, pointCount = 10, amplitude = 1, speed = 0.1 }) => {
  const [wigglePath, setWigglePath] = useState(d);

  useEffect(() => {
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", d);

    const seed = Math.random() * 100;
    const points = generateWigglePoints(pathElement, pointCount, seed, amplitude);

    let frame = 0;
    let animationFrame;

    const animate = () => {
      const smoothedPoints = points.map(({ x, y, offsetX, offsetY }, i) => ({
        x: x + Math.sin((frame + i) * speed) * offsetX,
        y: y + Math.cos((frame + i) * speed) * offsetY,
      }));

      setWigglePath(smoothPath(smoothedPoints));
      frame++;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [d, pointCount, amplitude, speed]);

  return (
    <svg
      viewBox="0 0 100 100" // SVGのサイズを大きくする
      xmlns="http://www.w3.org/2000/svg"
      width="1000" // 画面に合わせたサイズ
      height="700"
    >
      <path
        d={wigglePath}
        fill="blue" // 色を設定
        stroke="black"
        strokeWidth="0.1"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const App = () => {
  const svgRef = React.useRef(null);
  const [pathData, setPathData] = useState("");
  const [amplitude, setAmplitude] = useState(10); // 揺れ幅
  const [speed, setSpeed] = useState(0.1); // 速さ
  const [pointCount, setPointCount] = useState(10); // 初期のpointCount

  useEffect(() => {
    if (svgRef.current) {
      const pathElement = svgRef.current.querySelector("path");
      if (pathElement) {
        setPathData(pathElement.getAttribute("d"));
      }
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        overflow: "hidden", // 見切れを防ぐ
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Wiggling Path</h1>
        <AssetSvg
          ref={svgRef}
          style={{ display: "none" }}
        />
        {pathData && (
          <WigglePath
            d={pathData}
            amplitude={amplitude}
            speed={speed}
            pointCount={pointCount} // pointCountを渡す
          />
        )}

        {/* React-BootstrapのForm.Rangeを使ったスライダー */}
        <div>
          <label>
            揺れ幅:
            <Form.Range
              min={1}
              max={50}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            速さ:
            <Form.Range
              min={0.001}
              max={0.5}
              step={0.001}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            ポイント数:
            <Form.Range
              min={5}
              max={50}
              value={pointCount}
              onChange={(e) => setPointCount(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;
