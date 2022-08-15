import { useEffect, useState } from "react";
import colors from "./Colors";

function Content({ mode }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const correctColor = (bg) => {
    if (mode === "light") {
      var bg1 = parseInt(Number(bg.substring(0, 7).replace('#', '0x')), 10);
      bg1 = ~bg1;
      bg1 = bg1 >>> 0;
      bg1 = bg1 & 0x00ffffff;
      bg1 = '#' + bg1.toString(16).padStart(6, "0") + bg.substring(7, 9);

      return bg1;
    }
    return bg;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(50);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      <div style={{
        position: "fixed",
        background: `linear-gradient(to right, ${colors.icon} ${scrollPosition}%, transparent 0)`,
        width: "100%",
        height: "4px",
        zIndex: "3"
      }} />
      <header></header>
      <main style={{
        height: "100vh",
        // "color: colors.text
      }}>
        <section style={{
          background: correctColor(colors.focus + "80"),
        }}>
          <h1 style={{
            fontSize: "100px"
          }}>Welcome Home</h1>
          <hr />
          <div style={{
            width: "50%",
            fontSize: "20px",
            textAlign: "center"
          }}>
            <p>
              This is my website and I'll be posting all the results of my development endevours alongside other projects and life-updates (if you are into that).
              Right now it might seem quite empty but hopefully that changes soon.
            </p>
            <p>
              So have fun!
            </p>
          </div>
        </section>
        {/* <section style={{
          "background: correctColor(colors.success + "80"),
        }}>
          <h1>Acads</h1>
        </section>
        <section style={{
          "background: correctColor(colors.icon + "80"),
        }}>
          <h1>Coding</h1>
        </section>
        <section style={{
          "background: correctColor(colors.warning + "80"),
        }}>
          <h1>Art</h1>
        </section>
        <section style={{
          "background: correctColor(colors.error + "80"),
        }}>
          <h1>Interests</h1>
        </section>
        <section style={{
          "background: correctColor(colors.text + "80"),
        }}>
          <h1>Contact</h1>
        </section> */}
      </main>
    </>
  );
}

export default Content;