import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { DashboardService, liveWebSocketUrl } from '../services/api';
import { Activity, Target, Battery, AlertTriangle, ShieldCheck, Map as MapIcon, Compass, Wifi, Cpu, Gauge } from 'lucide-react';

// Component Imports
import { VideoPlayer } from '../components/dashboard/VideoPlayer';
import { DriveModeCard } from '../components/dashboard/DriveModeCard';
import { SuspensionCard } from '../components/dashboard/SuspensionCard';
import { StatusCard } from '../components/dashboard/StatusCard';
import { Loading } from '../components/ui/Loading';
import { BaseCard } from '../components/ui/BaseCard';

const SimulationCard = lazy(() => import('../components/dashboard/SimulationCard').then(m => ({ default: m.SimulationCard })));

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
};

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [dataSource, setDataSource] = useState('OFFLINE');
  const [missionEvents, setMissionEvents] = useState<any[]>([]);

  const [telemetry, setTelemetry] = useState({
    suspension: 'N/A',
    terrain: 'WAITING FOR AI',
    severity: 'N/A',
    severityScore: null as number | null,
    driveMode: 'N/A',
    riskLevel: 'N/A',
    rideHeight: 'N/A',
    recommendedSpeed: null as number | null,
    steering: 'WAITING',
    confidence: null as number | null,
    boundingBoxes: [],
    cameraFps: null as number | null,
    aiLatency: null as number | null,
    sensorState: {
      imu: 'N/A',
      ultrasonic: 'N/A',
      battery: 'N/A',
      servo: 'N/A'
    },
    animation: 'normal'
  });
  const [vehicleTelemetry, setVehicleTelemetry] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState({
    websocketConnected: false
  });

  useEffect(() => {
    let mounted = true;
    DashboardService.getDashboardData()
      .then(res => {
        if (mounted) {
          setData(res);
          setDataSource(res.dataSource || 'MOCK / DEMO');
        }
      })
      .catch(err => {
        if (mounted) setError(err);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const socket = new WebSocket(liveWebSocketUrl);
    wsRef.current = socket;
    socket.onopen = () => {
      setConnectionState({ websocketConnected: true });
    };
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry') {
          setConnectionState({ websocketConnected: true });
          const vehiclePayload = msg.vehicle_telemetry || msg.vehicle_status || null;
          const vehicleIsConnected = msg.vehicle_connected === true || Boolean(vehiclePayload);
          const messageSource = String(msg.data_source || '').toUpperCase();
          if (vehicleIsConnected || messageSource === 'REAL VEHICLE') {
            setDataSource('REAL VEHICLE');
            if (vehiclePayload) setVehicleTelemetry(vehiclePayload);
          } else if (msg.simulation_mode === true || messageSource === 'SIMULATION') {
            setDataSource('SIMULATION');
          }

          const nextSeverity = msg.severity || 'N/A';
          const normalizedSeverity = typeof nextSeverity === 'string' ? nextSeverity : String(nextSeverity || 'Low');
          const confidence = msg.confidence === undefined || msg.confidence === null
            ? null
            : Number(msg.confidence) <= 1 ? Number(msg.confidence) * 100 : Number(msg.confidence);

          setTelemetry(prev => ({
            ...prev,
            suspension: msg.suspension ?? prev.suspension,
            terrain: msg.terrain ?? (msg.detections?.length === 0 ? 'NO TERRAIN DETECTED' : prev.terrain),
            severity: normalizedSeverity,
            severityScore: msg.severity_score ?? prev.severityScore,
            driveMode: msg.drive_mode ?? prev.driveMode,
            riskLevel: msg.risk_level ?? msg.riskLevel ?? prev.riskLevel,
            rideHeight: msg.ride_height ?? prev.rideHeight,
            recommendedSpeed: msg.recommended_speed ?? msg.target_speed ?? prev.recommendedSpeed,
            steering: msg.steering_recommendation ?? msg.steering ?? prev.steering,
            confidence,
            cameraFps: msg.camera_fps ?? prev.cameraFps,
            aiLatency: msg.latency_ms ?? prev.aiLatency,
            animation: msg.animation ?? prev.animation,
            boundingBoxes: msg.detections ?? prev.boundingBoxes,
            sensorState: {
              imu: msg.sensor_state?.imu ?? prev.sensorState.imu,
              ultrasonic: msg.sensor_state?.ultrasonic ?? prev.sensorState.ultrasonic,
              battery: msg.sensor_state?.battery ?? prev.sensorState.battery,
              servo: msg.sensor_state?.servo ?? prev.sensorState.servo
            }
          }));

          if (msg.alert && msg.alert !== 'Clear path') {
            setMissionEvents(prev => [
              { id: Date.now(), time: new Date().toLocaleTimeString(), type: normalizedSeverity, message: msg.alert },
              ...prev
            ].slice(0, 10));
          }
        }
      } catch (err) {
        // Ignore non-JSON websocket messages and continue; avoids crashing the dashboard on ping or echo messages.
      }
    };

    socket.onclose = () => {
      setConnectionState({ websocketConnected: false });
      setDataSource('OFFLINE');
      setVehicleTelemetry(null);
      setMissionEvents([]);
      setTelemetry(prev => ({
        ...prev,
        suspension: 'N/A',
        terrain: 'WAITING FOR AI',
        severity: 'N/A',
        severityScore: null,
        driveMode: 'N/A',
        riskLevel: 'N/A',
        rideHeight: 'N/A',
        recommendedSpeed: null,
        steering: 'WAITING',
        confidence: null,
        boundingBoxes: [],
        cameraFps: null,
        aiLatency: null,
        sensorState: { imu: 'N/A', ultrasonic: 'N/A', battery: 'N/A', servo: 'N/A' }
      }));
    };
    socket.onerror = () => {
      setConnectionState({ websocketConnected: false });
      setDataSource('OFFLINE');
      setVehicleTelemetry(null);
    };

    return () => socket.close();
  }, []);

  const websocketConnected = connectionState.websocketConnected;
  const vehicleConnected = websocketConnected && dataSource === 'REAL VEHICLE';
  const vehicleConnectionStatus = vehicleConnected ? 'CONNECTED' : dataSource === 'SIMULATION' ? 'SIMULATION' : 'DISCONNECTED';
  const systemStatus = vehicleConnected ? 'NOMINAL' : dataSource;
  const actualVehicle = vehicleConnected ? vehicleTelemetry : null;
  const terrainScore = telemetry.severityScore;

  if (error) throw error;

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[500px]">
        <Loading message="Establishing Telemetry Uplink..." />
      </div>
    );
  }

  const terrainColor = terrainScore === null ? 'bg-automotive-muted' : terrainScore > 7 ? 'bg-automotive-danger' : terrainScore > 4 ? 'bg-automotive-warning' : 'bg-automotive-green';

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end gap-4 flex-wrap">
          <div>
            <p className="text-[12px] font-[600] uppercase tracking-[0.28em] text-automotive-blue mb-3">TATA INNOVENT</p>
            <h1 className="text-[38px] font-[700] text-automotive-white tracking-tight leading-none">
              AI-POWERED OFF-ROAD AUTONOMOUS NAVIGATION
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-automotive-card border border-automotive-border rounded-[12px] px-4 py-2 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${vehicleConnected ? 'bg-automotive-green' : websocketConnected ? 'bg-automotive-warning' : 'bg-automotive-danger'}`}></div>
              <span className="text-[12px] font-[600] text-automotive-white tracking-[0.14em] uppercase">Vehicle: {vehicleConnectionStatus}</span>
            </div>
            <div className="bg-automotive-card border border-automotive-border rounded-[12px] px-4 py-2 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${websocketConnected ? 'bg-automotive-blue animate-pulse shadow-[0_0_8px_#00C8FF]' : 'bg-automotive-danger'}`}></div>
              <span className="text-[12px] font-[600] text-automotive-white tracking-[0.14em] uppercase">WebSocket: {websocketConnected ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div title="Telemetry values are only live when the source is REAL VEHICLE; seeded API values are marked MOCK / DEMO." className="bg-automotive-card border border-automotive-border rounded-[12px] px-4 py-2 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${vehicleConnected ? 'bg-automotive-green' : 'bg-automotive-warning'}`}></div>
              <span className="text-[12px] font-[600] text-automotive-white tracking-[0.14em] uppercase">{dataSource === 'SIMULATION' ? 'SIMULATION MODE' : dataSource}</span>
            </div>
            <div className="bg-automotive-card border border-automotive-border rounded-[12px] px-4 py-2 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${telemetry.aiLatency === null ? 'bg-automotive-muted' : 'bg-automotive-warning'}`}></div>
              <span className="text-[12px] font-[600] text-automotive-white tracking-[0.14em] uppercase">Latency: {telemetry.aiLatency ?? 'N/A'}{telemetry.aiLatency === null ? '' : ' ms'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseCard title="System Status" icon={Wifi} statusActive={systemStatus === 'NOMINAL' || systemStatus === 'SIMULATION'}>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Mode</span>
              <span className="text-[22px] font-[700] text-automotive-white">{systemStatus}</span>
              <span className="text-[12px] text-automotive-green">Network: {vehicleConnected ? actualVehicle?.network || 'N/A' : 'N/A'}</span>
            </div>
          </BaseCard>

          <BaseCard title="AI Performance" icon={Cpu}>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Inference</span>
              <span className="text-[22px] font-[700] text-automotive-white">{telemetry.cameraFps ?? 'N/A'}{telemetry.cameraFps === null ? '' : ' FPS'}</span>
              <span className="text-[12px] text-automotive-blue">Latency {telemetry.aiLatency ?? 'N/A'}{telemetry.aiLatency === null ? '' : ' ms'}</span>
            </div>
          </BaseCard>

          <BaseCard title="Terrain Confidence" icon={Target}>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Confidence</span>
              <span className="text-[22px] font-[700] text-automotive-white">{telemetry.confidence === null ? 'N/A' : `${telemetry.confidence.toFixed(0)}%`}</span>
              <span className="text-[12px] text-automotive-green">{telemetry.terrain}</span>
            </div>
          </BaseCard>

          <BaseCard title="Risk Level" icon={AlertTriangle}>
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Assessment</span>
              <span className="text-[22px] font-[700] text-automotive-white">{telemetry.riskLevel}</span>
              <span className="text-[12px] text-automotive-warning">Severity {telemetry.severity}</span>
            </div>
          </BaseCard>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
          <div className="min-h-[430px] bg-automotive-card border border-automotive-border rounded-[12px] overflow-hidden flex flex-col p-1">
            <VideoPlayer
              status={data.video.status}
              resolution={data.video.resolution}
              fps={vehicleConnected ? telemetry.cameraFps : null}
              source={vehicleConnected ? data.video.source : 'CAMERA SOURCE N/A'}
              streamUrl={data.video.url}
              boundingBoxes={telemetry.boundingBoxes}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseCard title="Terrain Analysis" icon={MapIcon}>
              <div className="flex flex-col h-full justify-between gap-4 mt-1">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-[400] text-automotive-muted">Terrain</span>
                    <span className="text-[24px] font-[700] text-automotive-white tracking-tight">{telemetry.terrain}</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-[13px] font-[400] text-automotive-muted">Confidence</span>
                    <span className="text-[24px] font-[700] text-automotive-green font-display">{telemetry.confidence === null ? 'N/A' : `${telemetry.confidence.toFixed(0)}%`}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[13px] font-[400] text-automotive-muted">
                    <span>Severity</span>
                    <span className="font-[600] text-automotive-white">{telemetry.severity}</span>
                  </div>
                  <div className="h-2 w-full bg-automotive-background rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-500 ${terrainColor}`} style={{ width: `${terrainScore === null ? 0 : Math.min((terrainScore / 10) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[12px] text-automotive-muted">
                  <div className="rounded bg-automotive-background p-2">
                    <span className="block uppercase tracking-[0.14em] mb-1">Risk</span>
                    <span className="text-[16px] font-[700] text-automotive-white">{telemetry.riskLevel}</span>
                  </div>
                  <div className="rounded bg-automotive-background p-2">
                    <span className="block uppercase tracking-[0.14em] mb-1">Drive Mode</span>
                    <span className="text-[16px] font-[700] text-automotive-white">{telemetry.driveMode}</span>
                  </div>
                </div>
              </div>
            </BaseCard>

            <BaseCard title="Navigation Recommendation" icon={Compass}>
              <div className="flex flex-col h-full justify-between gap-4 mt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded bg-automotive-background p-3">
                    <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Drive Mode</span>
                    <p className="text-[16px] font-[700] text-automotive-white mt-1">{telemetry.driveMode}</p>
                  </div>
                  <div className="rounded bg-automotive-background p-3">
                    <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Ride Height</span>
                    <p className="text-[16px] font-[700] text-automotive-white mt-1">{telemetry.rideHeight}</p>
                  </div>
                  <div className="rounded bg-automotive-background p-3">
                    <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Speed</span>
                    <p className="text-[16px] font-[700] text-automotive-white mt-1">{telemetry.recommendedSpeed === null ? 'N/A' : `${telemetry.recommendedSpeed} km/h`}</p>
                  </div>
                  <div className="rounded bg-automotive-background p-3">
                    <span className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">Steering</span>
                    <p className="text-[16px] font-[700] text-automotive-white mt-1">{telemetry.steering}</p>
                  </div>
                </div>

                <div className="rounded border border-automotive-blue/30 bg-automotive-blue/10 p-3 text-[13px] text-automotive-white">
                  {telemetry.recommendedSpeed === null ? 'WAITING FOR AI RECOMMENDATION' : `AI recommends ${telemetry.driveMode} with ${telemetry.steering} handling at ${telemetry.recommendedSpeed} km/h.`}
                </div>
              </div>
            </BaseCard>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[300px]">
            <Suspense fallback={<Loading message="Initializing 3D Environment..." />}>
              <SimulationCard
                status="SIMULATION"
                suspension={telemetry.suspension}
                driveMode={telemetry.driveMode}
                terrain={telemetry.terrain}
                severity={telemetry.severity}
                animation={(telemetry as any).animation || 'normal'}
              />
            </Suspense>
          </div>

          <StatusCard
            speed={actualVehicle?.speed ?? null}
            rpm={actualVehicle?.rpm ?? null}
            gear={actualVehicle?.gear ?? null}
            battery={actualVehicle?.battery ?? null}
            temp={actualVehicle?.temp ?? null}
          />

          <div className="grid grid-cols-2 gap-6">
            <DriveModeCard
              currentMode={telemetry.driveMode}
              activeAssist={actualVehicle?.activeAssist || []}
            />
            <SuspensionCard
              frontLeft={actualVehicle?.suspension?.frontLeft ?? null}
              frontRight={actualVehicle?.suspension?.frontRight ?? null}
              rearLeft={actualVehicle?.suspension?.rearLeft ?? null}
              rearRight={actualVehicle?.suspension?.rearRight ?? null}
              mode={telemetry.rideHeight}
              status={vehicleConnected ? 'CONNECTED' : 'OFFLINE'}
            />
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        <motion.div variants={itemVariants}>
          <BaseCard title="Sensor Monitoring" icon={Gauge}>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {Object.entries(telemetry.sensorState).map(([key, value]) => (
                <div key={key} className="rounded bg-automotive-background p-3 border border-automotive-border">
                  <p className="text-[12px] uppercase tracking-[0.18em] text-automotive-muted">{key}</p>
                  <p className="mt-2 text-[16px] font-[700] text-automotive-white">{String(value)}</p>
                </div>
              ))}
            </div>
          </BaseCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BaseCard title="Vehicle Telemetry" icon={Battery}>
            <div className="flex flex-col gap-3 mt-2">
              <div className="rounded bg-automotive-background p-3 flex justify-between">
                <span className="text-automotive-muted">Battery</span>
                <span className="font-[700] text-automotive-white">{actualVehicle?.battery == null ? 'N/A' : `${actualVehicle.battery}%`}</span>
              </div>
              <div className="rounded bg-automotive-background p-3 flex justify-between">
                <span className="text-automotive-muted">Camera FPS</span>
                <span className="font-[700] text-automotive-white">{telemetry.cameraFps ?? 'N/A'}</span>
              </div>
              <div className="rounded bg-automotive-background p-3 flex justify-between">
                <span className="text-automotive-muted">Latency</span>
                <span className="font-[700] text-automotive-white">{telemetry.aiLatency === null ? 'N/A' : `${telemetry.aiLatency} ms`}</span>
              </div>
              <div className="rounded bg-automotive-background p-3 flex justify-between">
                <span className="text-automotive-muted">System</span>
                <span className="font-[700] text-automotive-white">{systemStatus}</span>
              </div>
            </div>
          </BaseCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BaseCard title="Mission Activity" icon={Activity}>
            <div className="flex flex-col gap-4 mt-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-4">
              {missionEvents.map((alert: any, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-automotive-background/50 border border-automotive-border rounded-lg p-4 transition-colors hover:bg-white/5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    alert.type === 'Critical' ? 'bg-automotive-danger/20 text-automotive-danger' :
                    alert.type === 'Warning' ? 'bg-automotive-warning/20 text-automotive-warning' :
                    'bg-automotive-blue/20 text-automotive-blue'
                  }`}>
                    {alert.type === 'Critical' ? <AlertTriangle className="w-5 h-5" /> :
                      alert.type === 'Warning' ? <ShieldCheck className="w-5 h-5" /> :
                      <Compass className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[15px] font-[600] text-automotive-white">{alert.message}</span>
                      <span className="text-[12px] font-[400] text-automotive-muted font-display">{alert.time}</span>
                    </div>
                    <span className="text-[12px] font-[400] text-automotive-muted mt-1">
                      {alert.type === 'Critical' ? 'Critical AI recommendation logged. Operator review required.' :
                        alert.type === 'Warning' ? 'Caution advised. Suspension dynamics adjusting.' :
                        'Standard mission event logged.'}
                    </span>
                  </div>
                </div>
              ))}
              {missionEvents.length === 0 && (
                <div className="py-10 text-center flex flex-col items-center gap-2 text-automotive-muted">
                  <ShieldCheck className="w-8 h-8 opacity-50" />
                  <span className="text-[15px] font-[400]">WAITING FOR MISSION EVENTS</span>
                </div>
              )}
            </div>
          </BaseCard>
        </motion.div>
      </motion.div>
    </div>
  );
};
