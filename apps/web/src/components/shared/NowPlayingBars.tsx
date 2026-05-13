const equalizerStyle = `
  @keyframes bar1 {
    0%, 100% { height: 4px; }
    25%       { height: 14px; }
    75%       { height: 6px; }
  }
  @keyframes bar2 {
    0%, 100% { height: 10px; }
    40%       { height: 3px; }
    60%       { height: 14px; }
  }
  @keyframes bar3 {
    0%, 100% { height: 6px; }
    30%       { height: 14px; }
    70%       { height: 4px; }
  }
  .eq-bar-1 { animation: bar1 1.0s ease-in-out infinite; }
  .eq-bar-2 { animation: bar2 1.1s ease-in-out infinite 0.18s; }
  .eq-bar-3 { animation: bar3 0.9s ease-in-out infinite 0.09s; }
`;

interface NowPlayingBarsProps {
  paused?: boolean;
}

/**
 * Tres barras que se mueven al ritmo estilizando el reproductor de música en listas.
 */
export default function NowPlayingBars({ paused = false }: NowPlayingBarsProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: equalizerStyle }} />
      <span
        className="inline-flex items-end gap-[2px] h-[14px] w-[14px]"
        aria-label="Reproduciendo"
      >
        {["eq-bar-1", "eq-bar-2", "eq-bar-3"].map((cls) => (
          <span
            key={cls}
            className={[
              "w-[3px] rounded-full bg-amethyst dark:bg-orchid origin-bottom",
              paused ? "" : cls,
            ].join(" ")}
            style={paused ? { height: "8px" } : undefined}
          />
        ))}
      </span>
    </>
  );
}
