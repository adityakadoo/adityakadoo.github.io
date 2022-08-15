import { useEffect, useState, useCallback, useRef } from 'react';
import colors from './Colors';
import * as Icons from "./iconComponents/index.js";
import Content from './Content';

function App() {
  const [lightMode, setLightMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuApps, setMenuApps] = useState(<></>);
  const [offcanvas, setOffcanvas] = useState(false);
  const [currFrame, setCurrFrame] = useState("Home");
  const [menuCols, setMenuCols] = useState(1);
  const [appFrames, setAppFrames] = useState({
    "Home": {
      "light": <Content mode="light" />,
      "dark": <Content mode="dark" />
    }
  });
  const [navVisible, setNavVisible] = useState(true);
  const prevScrollPos = useRef(window.pageYOffset);
  const handleScroll = useCallback(() => {
    const currentScrollPos = window.pageYOffset;
    const visible = prevScrollPos > currentScrollPos;
    prevScrollPos.current = currentScrollPos;
    if (navVisible !== visible) setNavVisible(visible);
    console.log("hii");
  }, [navVisible]);

  const correctColor = useCallback((bg) => {
    if (lightMode) {
      var bg1 = parseInt(Number(bg.substring(0, 7).replace('#', '0x')), 10);
      bg1 = ~bg1;
      bg1 = bg1 >>> 0;
      bg1 = bg1 & 0x00ffffff;
      bg1 = '#' + bg1.toString(16).padStart(6, "0") + bg.substring(7, 9);

      return bg1;
    }
    return bg;
  }, [lightMode]);

  useEffect(() => {
    const menuIcons = {
      "Home": {
        "icon": <Icons.Home style={{
          "height": "50px",
          "width": "50px"
        }} />,
        "kanji": "家"
      },
      "RubiksCube": {
        "icon": <Icons.RubiksCube style={{
          "height": "50px",
          "width": "50px"
        }} />,
        "kanji": "乗"
      }
    }
    fetch(`https://api.github.com/users/adityakadoo/repos`)
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          var repo_list = {};
          result.forEach(element => {
            if (element.name === `adityakadoo.github.io`) {
              repo_list["Home"] = "/"
            }
            else if (element.has_pages && element.name !== `adityakadoo.github.io`) {
              repo_list[element.name] = "/" + element.name;
            }
          });
          setMenuCols(Object.keys(repo_list).length >= 3 ? 3 : Object.keys(repo_list).length);

          var frames = appFrames;
          Object.keys(repo_list).forEach((key) => {
            frames[key] = {
              "light": (
                <>
                  {key !== `Home` ? <main style={{ "width": "100%", "height": "100%" }}>
                    <iframe frameBorder="0" style={{
                      "width": "100%",
                      "height": "100%"
                    }} src={`${repo_list[key]}?mode=light`} title={key} />
                    <button style={{
                      "backgroundColor": correctColor(colors.focus),
                      "width": "50px",
                      "height": "50px",
                      "position": "absolute",
                      "bottom": "5px",
                      "right": "5px",
                      "zIndex": "5",
                      "borderRadius": "10%"
                    }}>
                      <a href={repo_list[key]} target="_blank" rel="noopener noreferrer">
                        <Icons.OpenInNew style={{
                          "height": "50px",
                          "width": "50px"
                        }} />
                      </a>
                    </button>
                  </main> : <Content mode="light" />}
                </>
              ),
              "dark": (
                <>
                  {key !== `Home` ? <main style={{ "width": "100%", "height": "100%" }}>
                    <iframe frameBorder="0" style={{
                      "width": "100%",
                      "height": "100%"
                    }} src={`${repo_list[key]}?mode=dark`} title={key} />
                    <button style={{
                      "backgroundColor": correctColor(colors.focus),
                      "width": "50px",
                      "height": "50px",
                      "position": "absolute",
                      "bottom": "5px",
                      "right": "5px",
                      "zIndex": "5",
                      "borderRadius": "10%"
                    }}>
                      <a href={repo_list[key]} target="_blank" rel="noopener noreferrer">
                        <Icons.OpenInNew style={{
                          "height": "50px",
                          "width": "50px"
                        }} />
                      </a>
                    </button>
                  </main> : <Content mode="dark" />}
                </>
              )
            };
          });
          setAppFrames(frames);

          setMenuApps(Object.keys(repo_list).map((key) => (
            <button key={key} style={{
              "width": "62.5px",
              "height": "62.5px"
            }} onClick={(event) => {
              setCurrFrame(key);
              setOffcanvas(false);
            }} title={key} >
              <div style={{
                "height": "62.5px",
                "width": "50px",
                "position": "relative",
                "top": "0",
                "left": "0",
              }}>
                {menuIcons[key].icon}
              </div>
              <div style={{
                "height": "31.25px",
                "width": "31.25px",
                "fontSize": "31.25px",
                "position": "relative",
                "zIndex": "5",
                "top": "-31.25px",
                "left": "31.25px",
                "fontWeight": "bold",
                "color": correctColor(colors.icon)
              }}>{menuIcons[key].kanji}</div>
            </button >
          )));
        },
        (error) => {
          setIsLoaded(true);
          setMenuApps(<div style={{
            "width": "50px",
            "height": "50px"
          }}>Error: {error.message}</div>);
        }
      );
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [correctColor, appFrames, handleScroll])
  
  return (
    <div style={{
      "display": "flex",
      "width": "100%",
      "height": "100%",
      "flexDirection": "column",
      "overflowX": "hidden",
      "color": correctColor(colors.text),
      "backgroundColor": correctColor(colors.bg)
    }}>
      <nav style={{
        "backgroundColor": correctColor(colors.focus),
        "display": "flex",
        "flexDirection": "row",
        "padding": "7px",
        "boxShadow": "0 2px 4px 0 " + correctColor(colors.bg),
        "position": "fixed",
        "width": "100%"
      }}>
        <div style={{
          "height": "100%",
          "width": offcanvas ? "300px" : "0",
          "position": "fixed",
          "zIndex": "3",
          "top": "0",
          "left": "0",
          "backgroundColor": correctColor(colors.focus),
          "overflowX": "hidden",
          "paddingTop": "30px",
          "transition": "0.3s"
        }}>
          <div style={{
            "display": "flex",
            "flexDirection": "row",
            "height": "50px",
            "width": "100%"
          }}>
            <div style={{
              "flexGrow": "1",
              "margin": "10px",
              "color": correctColor(colors.bold)
            }}>
              <h2>Explore</h2>
            </div>
            <button style={{
              "width": "40px",
              "marginRight": "20px"
            }} title="Close menu" onClick={(event) => { setOffcanvas(false); }}>
              <Icons.Close style={{
                "width": "40px",
                "height": "40px"
              }} />
            </button>
          </div>
          <div style={{
            "display": "grid",
            "gridTemplateColumns": "repeat(" + menuCols + ",auto)",
            "justifyContent": "space-evenly",
            "marginTop": "15px"
          }}>
            {isLoaded ? menuApps : <div>Loading...</div>}
          </div>
        </div>
        <div style={{
          "height": "100%",
          "width": offcanvas ? "100%" : "0",
          "position": "fixed",
          "zIndex": "1",
          "top": "0",
          "left": "0",
          "backgroundColor": correctColor(colors.blur),
          "overflowX": "hidden"
        }} onClick={(event) => { setOffcanvas(false); }} />
        <button style={{
          "width": "40px",
          "height": "40px",
        }} title="Open menu" onClick={(event) => { setOffcanvas(true); }}>
          <Icons.Apps style={{
            "width": "40px",
            "color": "currentColor",
            "height": "40px"
          }} />
        </button>
        <div style={{
          "padding": "10px 20px",
          "color": correctColor(colors.bold),
          "fontWeight": "bold"
        }}>
          <h1>
            Aditya Kadoo
          </h1>
        </div>
        <button style={{
          "width": "50px",
          "height": "50px",
          "marginLeft": "auto",
          "marginRight": "10px",
          "color": correctColor(colors.bold)
        }} onClick={(event) => { setLightMode(!lightMode); }}>
          {lightMode ? <Icons.ToggleOff style={{
            "width": "50px",
            "height": "50px"
          }} /> : <Icons.ToggleOn style={{
            "width": "50px",
            "height": "50px"
          }} />}
        </button>
      </nav>
      <div style={{
        "flexGrow": "1",
        "border": "none",
        "margin": "0",
        "padding": "0"
      }}>
        {appFrames[currFrame][lightMode ? "light" : "dark"]}
      </div>
    </div>
  );
}

export default App;
