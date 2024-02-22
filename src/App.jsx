import clsx from "clsx";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const loader = (l) =>
  l ? (
    <div className="self-center">
      <small>Loading&hellip;</small>
    </div>
  ) : null;

const AudioPlayer = memo(
  forwardRef((props, ref) => (
    <audio
      {...props}
      ref={ref}
      className="self-stretch"
      controls
      src="/P9JwqXSnYAw.mp3"
    ></audio>
  ))
);

export default function App() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  /**
   * @type {import("react").Ref<HTMLParagraphElement>}
   */
  const actualElementRef = useRef(null);

  /**
   * @type {import("react").Ref<HTMLAudioElement>}
   */
  const audioRef = useRef(null);

  const isActive = useCallback((segment) => currentTime >= segment.start);
  const isExactActive = useCallback(
    (segment) => currentTime >= segment.start && currentTime <= segment.end
  );

  useEffect(() => {
    const onUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
      requestAnimationFrame(onUpdate);
    };

    const hid = requestAnimationFrame(onUpdate);
    return () => cancelAnimationFrame(hid);
  }, []);

  useEffect(() => {
    (async function () {
      setLoading(true);
      const response = await fetch("/P9JwqXSnYAw.jsonl");
      const jsonlines = await response.text();
      const _segments = [];
      for (const line of jsonlines.split("\n")) {
        if (!line) continue;
        const { text, start, end, actual_end, actual_start } = JSON.parse(line);
        _segments.push({
          text: text.replace(/[។៕?!]/gm, " "),
          start: actual_start,
          end: actual_end,
        });
      }
      setSegments(_segments);
      setLoading(false);
    })();
  }, []);

  const onSeekTo = useCallback((element) => {
    audioRef.current.currentTime = parseFloat(
      element.target.dataset["startTime"]
    );
  });

  return (
    <main className="container gap-sm flex-col">
      <h2 className="text-center logo">Sync Reader</h2>
      <p className="text-center">
        Automatically sync audio speech with transcription
      </p>
      <hr />
      <div className="flex-col m-4 gap-lg">
        <AudioPlayer ref={audioRef} />
        <p ref={actualElementRef}>
          {segments.map((segment, i) => (
            <span
              onClick={onSeekTo}
              data-start-time={segment.start}
              className={clsx(
                "text",
                isActive(segment) ? "text-active" : null,
                isExactActive(segment) ? "text-exact-active" : null
              )}
              key={i}
            >
              {segment.text}
            </span>
          ))}
        </p>
      </div>
      {loader(loading)}
    </main>
  );
}
