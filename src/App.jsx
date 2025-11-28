import { useState, useEffect } from "react";

const DIRECTION_UUID = {
  service: "0000bbbb-0000-1000-8000-00805f9b34fb",
  characteristic: "0000cccc-0000-1000-8000-00805f9b34fb",
};

const SERVO_UUID = {
  service: "0000dddd-0000-1000-8000-00805f9b34fb",
  characteristic: "0000eeee-0000-1000-8000-00805f9b34fb",
};

export default function App() {
  const [dirDev, setDirDev] = useState(null);
  const [servoDev, setServoDev] = useState(null);
  const [angles, setAngles] = useState([90, 90, 90, 90, 90]);
  const [activeDir, setActiveDir] = useState(null);

  useEffect(() => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {
        console.log("Orientation lock not supported");
      });
    }
  }, []);

  async function connectDirection() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [DIRECTION_UUID.service] }],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(DIRECTION_UUID.service);
      const char = await service.getCharacteristic(DIRECTION_UUID.characteristic);
      setDirDev(char);
    } catch (e) {
      console.error(e);
    }
  }

  async function connectServo() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVO_UUID.service] }],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVO_UUID.service);
      const char = await service.getCharacteristic(SERVO_UUID.characteristic);
      setServoDev(char);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendDirection(cmd) {
    if (!dirDev) return;
    setActiveDir(cmd);
    await dirDev.writeValue(new Uint8Array([cmd]));
    setTimeout(() => setActiveDir(null), 200);
  }

  async function sendAngles(a) {
    if (!servoDev) return;
    await servoDev.writeValue(new Uint8Array(a));
  }

  function updateAngle(i, val) {
    const newA = [...angles];
    newA[i] = parseInt(val);
    setAngles(newA);
    sendAngles(newA);
  }

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(145deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      fontFamily: "'Inter', 'Roboto', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700;
          }
          50% { 
            box-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 80px #ffd700;
          }
        }

        @keyframes goldGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 3px #ffd700) drop-shadow(0 0 6px #ffd700);
          }
          50% { 
            filter: drop-shadow(0 0 6px #ffd700) drop-shadow(0 0 12px #ffd700);
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "1400px",
        height: "100%",
        maxHeight: "800px",
        background: "linear-gradient(145deg, #2a1548 0%, #3d2060 100%)",
        borderRadius: "24px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 215, 0, 0.2), 0 0 80px rgba(255, 215, 0, 0.4)",
        border: "3px solid #ffd700",
        animation: "goldGlow 3s infinite",
        display: "flex",
        gap: "20px",
      }}>
        {/* LEFT PANEL - AXIS CONTROLS */}
        <div style={{
          flex: 1,
          background: "linear-gradient(145deg, #1a0a2e 0%, #2d1b4e 100%)",
          borderRadius: "16px",
          padding: "20px",
          border: "2px solid rgba(255, 215, 0, 0.5)",
          boxShadow: "0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative corner accent */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "60px",
            height: "60px",
            borderTop: "3px solid #ffd700",
            borderLeft: "3px solid #ffd700",
            borderRadius: "16px 0 0 0",
            opacity: 0.8,
          }}/>

          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}>Axis Control</h2>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: servoDev ? "#00ff88" : "#ff4444",
                boxShadow: servoDev 
                  ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                  : "0 0 10px #ff4444",
                animation: servoDev ? "none" : "neonPulse 1s infinite",
              }}/>
              <span style={{
                fontSize: "10px",
                color: servoDev ? "#00ff88" : "#ff4444",
                fontWeight: "600",
                textTransform: "uppercase",
              }}>{servoDev ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* Axis sliders */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            paddingRight: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {angles.map((a, i) => (
              <div key={i} style={{
                background: "rgba(255, 215, 0, 0.1)",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                borderRadius: "12px",
                padding: "12px 16px",
                transition: "all 0.3s ease",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#ffd700",
                    letterSpacing: "1px",
                  }}>AXIS {i + 1}</span>
                  <div style={{
                    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    color: "#1a0a2e",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    minWidth: "50px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(255, 215, 0, 0.5)",
                  }}>{a}°</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={a}
                  onChange={(e) => updateAngle(i, e.target.value)}
                  style={{
                    width: "100%",
                    height: "8px",
                    borderRadius: "4px",
                    background: `linear-gradient(to right, #ffd700 ${(a/180)*100}%, rgba(255, 215, 0, 0.2) ${(a/180)*100}%)`,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Connect button */}
          <button onClick={connectServo} style={{
            marginTop: "16px",
            padding: "14px",
            background: servoDev 
              ? "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)"
              : "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#1a0a2e",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            cursor: "pointer",
            boxShadow: servoDev
              ? "0 4px 20px rgba(0, 255, 136, 0.4)"
              : "0 4px 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            {servoDev ? "✓ Connected" : "Connect Servo"}
          </button>
        </div>

        {/* RIGHT PANEL - DIRECTION CONTROL */}
        <div style={{
          width: "50%",
          background: "linear-gradient(145deg, #1a0a2e 0%, #2d1b4e 100%)",
          borderRadius: "16px",
          padding: "20px",
          border: "2px solid rgba(255, 215, 0, 0.5)",
          boxShadow: "0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative corner accent */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "60px",
            borderTop: "3px solid #ffd700",
            borderRight: "3px solid #ffd700",
            borderRadius: "0 16px 0 0",
            opacity: 0.8,
          }}/>

          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}>Direction</h2>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: dirDev ? "#00ff88" : "#ff4444",
                boxShadow: dirDev 
                  ? "0 0 10px #00ff88, 0 0 20px #00ff88"
                  : "0 0 10px #ff4444",
                animation: dirDev ? "none" : "neonPulse 1s infinite",
              }}/>
              <span style={{
                fontSize: "10px",
                color: dirDev ? "#00ff88" : "#ff4444",
                fontWeight: "600",
                textTransform: "uppercase",
              }}>{dirDev ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* D-Pad */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "80px 80px 80px",
              gridTemplateRows: "80px 80px 80px",
              gap: "8px",
            }}>
              {/* Empty */}
              <div />
              
              {/* UP */}
              <button onClick={() => sendDirection(1)} style={{
                background: activeDir === 1 
                  ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                  : "linear-gradient(145deg, #2d1b4e 0%, #1a0a2e 100%)",
                border: "2px solid #ffd700",
                borderRadius: "12px",
                color: activeDir === 1 ? "#1a0a2e" : "#ffd700",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: activeDir === 1
                  ? "0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)"
                  : "0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.2)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                ▲
              </button>
              
              {/* Empty */}
              <div />
              
              {/* LEFT */}
              <button onClick={() => sendDirection(2)} style={{
                background: activeDir === 2
                  ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                  : "linear-gradient(145deg, #2d1b4e 0%, #1a0a2e 100%)",
                border: "2px solid #ffd700",
                borderRadius: "12px",
                color: activeDir === 2 ? "#1a0a2e" : "#ffd700",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: activeDir === 2
                  ? "0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)"
                  : "0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.2)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                ◄
              </button>
              
              {/* STOP */}
              <button onClick={() => sendDirection(0)} style={{
                background: activeDir === 0
                  ? "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)"
                  : "linear-gradient(145deg, #ff2d2d 0%, #aa0000 100%)",
                border: "3px solid #ffd700",
                borderRadius: "50%",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 30px rgba(255, 68, 68, 0.6), 0 0 10px rgba(255, 215, 0, 0.4)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Stop
              </button>
              
              {/* RIGHT */}
              <button onClick={() => sendDirection(3)} style={{
                background: activeDir === 3
                  ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                  : "linear-gradient(145deg, #2d1b4e 0%, #1a0a2e 100%)",
                border: "2px solid #ffd700",
                borderRadius: "12px",
                color: activeDir === 3 ? "#1a0a2e" : "#ffd700",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: activeDir === 3
                  ? "0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)"
                  : "0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.2)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                ►
              </button>
              
              {/* Empty */}
              <div />
              
              {/* DOWN */}
              <button onClick={() => sendDirection(4)} style={{
                background: activeDir === 4
                  ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                  : "linear-gradient(145deg, #2d1b4e 0%, #1a0a2e 100%)",
                border: "2px solid #ffd700",
                borderRadius: "12px",
                color: activeDir === 4 ? "#1a0a2e" : "#ffd700",
                fontSize: "28px",
                cursor: "pointer",
                boxShadow: activeDir === 4
                  ? "0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)"
                  : "0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.2)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                ▼
              </button>
              
              {/* Empty */}
              <div />
            </div>
          </div>

          {/* Connect button */}
          <button onClick={connectDirection} style={{
            marginTop: "16px",
            padding: "14px",
            background: dirDev
              ? "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)"
              : "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#1a0a2e",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            cursor: "pointer",
            boxShadow: dirDev
              ? "0 4px 20px rgba(0, 255, 136, 0.4)"
              : "0 4px 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            {dirDev ? "✓ Connected" : "Connect Direction"}
          </button>
        </div>
      </div>
    </div>
  );
}