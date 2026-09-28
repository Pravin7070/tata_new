const fs = require('fs');
const file = 'src/pages/Vehicle.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useEffect, useState, useRef }')) {
  content = "import { useEffect, useState, useRef } from 'react';\n" + content;
}

content = content.replace(
  'export const Vehicle = () => (',
  `export const Vehicle = () => {
  const [telemetry, setTelemetry] = useState<any>({
    battery: { charge: '94%', health: '99%', temp: '32°C', voltage: '412.5 V', current: '15.2 A', status: 'DISCHARGING' },
    motor: { status: 'NOMINAL', rpm: '1,250', temp: '45°C', load: '18%', efficiency: '92%', cooling: 'ACTIVE' }
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/live');
    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry') {
          setTelemetry((prev: any) => ({
            ...prev,
            // Merge in real values from backend if they exist, or simulate variation
          }));
        }
      } catch (err) {}
    };
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (`
);

content = content.replace(
  ');\n',
  ');\n};\n'
);

// We need to match the very last `);`
// Let's just do a specific replace for the end of file
content = content.replace(/ \);\r?\n?$/, '  );\n};\n');

fs.writeFileSync(file, content);
console.log('Vehicle state added');
