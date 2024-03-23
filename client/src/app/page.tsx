'use client'
import { useState } from "react";
export default function Home() {
  const [inputs, setInputs] = useState<string[]>([]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="main-div">
        Verse 1:
        <br />
        Every morning I wake up and see the <input type="text" />,
        <br />
        Singing tunes as sweet as a <input type="text" />.
        <br />
        I put on my <input type="text" />, feeling so <input type="text" />,
        <br />
        Ready to conquer the day, not a bit <input type="text" />.
        <br />

        <button className="submit-button">
          Submit
        </button>

        <br />
        Chorus:
        <br />
        Oh, <input type="text" />, you're my <input type="text" />,
        <br />
        In this world of <input type="text" /> and <input type="text" />.
        <br />
        With every step, I feel <input type="text" />,
        <br />
        Together we're <input type="text" />, oh so <input type="text" />.
        <br />

        <br />
        Bridge:
        <br />
        Under the <input type="text" /> sky so <input type="text" />,
        <br />
        We dance to the rhythm, feeling <input type="text" />.
        <br />
        <input type="text" /> and <input type="text" /> in our <input type="text" /> dream,
        <br />
        With you, everything's just as it seems.
        <br />

        <br />
        Outro:
        <br />
        So here's to the <input type="text" />, the <input type="text" />, and <input type="text" />,
        <br />
        With you, my heart feels <input type="text" />.
        <br />
        Let's sing this song from <input type="text" /> to <input type="text" />,
        <br />
        You're my <input type="text" />, forever more.
        <br />
      </div>
    </main>
  );
}
