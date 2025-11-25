import { useState, useEffect } from "react";

const DIRECTION_UUID = {
  service: "0000aaaa-0000-1000-8000-00805f9b34fb",
  characteristic: "0000aaab-0000-1000-8000-00805f9b34fb",
};

const SERVO_UUID = {
  service: "0000bbbb-0000-1000-8000-00805f9b34fb",
  characteristic: "0000bbbc-0000-1000-8000-00805f9b34fb",
};

export default function App() {
  const [dirDev, setDirDev] = useState(null);
  const [servoDev, setServoDev] = useState(null);

  const [angles, setAngles] = useState([90, 90, 90, 90, 90]);
  const [isLandscape, setIsLandscape] = useState(true);

  // ----------- ORIENTATION CHECK -----------
  const checkOrientation = () => {
    if (window.innerWidth > window.innerHeight) {
      setIsLandscape(true);
    } else {
      setIsLandscape(false);
    }
  };

  useEffect(() => {
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // ----------- BLE CONNECTIONS -----------
  async function connectDirection() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [DIRECTION_UUID.service] }],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(DIRECTION_UUID.service);
      const char = await service.getCharacteristic(DIRECTION_UUID.characteristic);
      setDirDev(char);
      alert("Direction ESP Connected!");
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
      alert("Servo ESP Connected!");
    } catch (e) {
      console.error(e);
    }
  }

  // ----------- SEND COMMANDS -----------
  async function sendDirection(cmd) {
    if (!dirDev) return alert("Direction ESP not connected!");
    await dirDev.writeValue(new Uint8Array([cmd]));
  }

  async function sendAngles(a) {
    if (!servoDev) return alert("Servo ESP not connected!");
    await servoDev.writeValue(new Uint8Array(a));
  }

  function updateAngle(i, val) {
    const newA = [...angles];
    newA[i] = parseInt(val);
    setAngles(newA);
    sendAngles(newA);
  }

  // ----------- PORTRAIT BLOCK SCREEN -----------
  if (!isLandscape) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          background: "#111",
          color: "white",
          padding: 20,
        }}
      >
        Rotate your phone to <br /> LANDSCAPE MODE 📱↔️
      </div>
    );
  }

  // ----------- MAIN LANDSCAPE UI -----------
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 10,
        gap: 10,
      }}
    >
      {/* LEFT: SERVO SLIDERS */}
      <div style={{ 
        flex: 1,
        background: "rgba(255,255,255,0.95)", 
        borderRadius: 16,
        padding: 15,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
      }}>
        <h2 style={{ margin: "0 0 12px 0", color: "#333", fontSize: 20 }}>🎛️ Servo Control</h2>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {angles.map((a, i) => (
            <div key={i} style={{ 
              marginBottom: 10,
              padding: 10,
              background: "#f8f9fa",
              borderRadius: 10,
              border: "2px solid #e9ecef",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong style={{ color: "#495057", fontSize: 14 }}>Motor {i + 1}</strong>
                <span style={{ 
                  background: "#667eea",
                  color: "white",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: "bold"
                }}>{a}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={a}
                style={{ 
                  width: "100%",
                  height: 6,
                  borderRadius: 4,
                  outline: "none",
                  background: `linear-gradient(to right, #667eea 0%, #667eea ${(a/180)*100}%, #e9ecef ${(a/180)*100}%, #e9ecef 100%)`,
                }}
                onChange={(e) => updateAngle(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button onClick={connectServo} style={{...connectBtn, background: "#667eea"}}>
          🔌 Connect Servo ESP
        </button>
      </div>

      {/* RIGHT: DIRECTION PAD */}
      <div style={{ 
        width: "45%",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 16,
        padding: 15,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#333", fontSize: 20 }}>🎮 Movement Control</h2>

        <div style={{ 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "center",
        }}>
          <button
            onClick={() => sendDirection(1)}
            style={{...btnStyle, background: "#10b981"}}
            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
              <path d="M12 4l-8 8h5v8h6v-8h5z"/>
            </svg>
          </button>

          <div style={{ display: "flex", gap: 6 }}>
            <button 
              onClick={() => sendDirection(2)} 
              style={{...btnStyle, background: "#3b82f6"}}
              onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.target.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
                <path d="M20 12l-8-8v5H4v6h8v5z"/>
              </svg>
            </button>
            
            <button 
              onClick={() => sendDirection(0)} 
              style={{...btnStyle, background: "#ef4444", width: 75, height: 75}}
              onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.target.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <svg width="45" height="45" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#ef4444"/>
                <rect x="7" y="11" width="10" height="2" fill="white"/>
              </svg>
            </button>
            
            <button 
              onClick={() => sendDirection(3)} 
              style={{...btnStyle, background: "#3b82f6"}}
              onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.target.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
                <path d="M4 12l8 8v-5h8V9h-8V4z"/>
              </svg>
            </button>
          </div>

          <button
            onClick={() => sendDirection(4)}
            style={{...btnStyle, background: "#10b981"}}
            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
              <path d="M12 20l8-8h-5V4H9v8H4z"/>
            </svg>
          </button>
        </div>

        <div style={{ width: "100%" }}>
          <button onClick={connectDirection} style={{...connectBtn, background: "#764ba2"}}>
            🔌 Connect Direction ESP
          </button>
        </div>
      </div>
    </div>
  );
}

// Button styling
const btnStyle = {
  padding: "12px",
  width: 70,
  height: 70,
  margin: "0",
  borderRadius: "14px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// Connect button styling
const connectBtn = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  fontSize: 15,
  fontWeight: "bold",
  cursor: "pointer",
  color: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
  width: "100%",
};