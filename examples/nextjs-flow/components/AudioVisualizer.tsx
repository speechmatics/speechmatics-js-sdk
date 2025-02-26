import { useEffect, useRef } from 'react';

const BAR_COUNT = 5;
const BAR_SPACING = 8;
const BAR_HEIGHT = 24;

export function AudioVisualizer({
  analyser,
  color = 'gray',
}: { analyser?: AnalyserNode; color?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let frameId: ReturnType<typeof requestAnimationFrame> | undefined =
      undefined;
    function report() {
      const lineElements = svgRef.current?.querySelectorAll('line');
      let barAmp = (_i: number) => 0;

      if (analyser) {
        const binCount = analyser.frequencyBinCount;
        const data = new Uint8Array(binCount);

        analyser.getByteFrequencyData(data);

        const clippedData = data.slice(0, data.length / 2);

        const stepSize = Math.floor(clippedData.length / BAR_COUNT);
        barAmp = (i: number) =>
          (BAR_HEIGHT *
            (data
              .slice(i * stepSize, (i + 1) * stepSize)
              .reduce((acc, curr) => acc + curr, 0) /
              stepSize)) /
          255;
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        lineElements?.[i].setAttribute('y1', `${BAR_HEIGHT - barAmp(i)}`);
        lineElements?.[i].setAttribute('y2', `${BAR_HEIGHT + barAmp(i)}`);
      }

      if (analyser) {
        frameId = requestAnimationFrame(report);
      }
    }

    report();

    return () => {
      if (typeof frameId === 'number') {
        cancelAnimationFrame(frameId);
      }
    };
  }, [analyser]);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width={`${BAR_HEIGHT}px`}
      height={`${BAR_HEIGHT}px`}
      viewBox={`0 0 ${BAR_HEIGHT * 2} ${BAR_HEIGHT * 2}`}
      fill="none"
    >
      <title>Audio</title>
      {new Array(BAR_COUNT).fill(null).map((_, n) => (
        <line
          // biome-ignore lint/suspicious/noArrayIndexKey: static
          key={n}
          x1={BAR_SPACING * n + BAR_HEIGHT / BAR_SPACING}
          x2={BAR_SPACING * n + BAR_HEIGHT / BAR_SPACING}
          y1={BAR_HEIGHT}
          y2={BAR_HEIGHT}
          stroke={color}
          strokeOpacity="1"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
