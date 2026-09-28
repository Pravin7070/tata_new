import { useState, useEffect, useRef } from 'react';
import { BaseCard } from '../components/ui/BaseCard';
import { Map as MapIcon, Navigation2, Compass, Route, Radio, Gauge, Battery as BatteryIcon, Mountain, Activity, Maximize, Minimize, LocateFixed } from 'lucide-react';
import { Toast } from '../components/ui/Toast';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, ZoomControl, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getRoverIcon = (heading: number | null) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div class="w-12 h-10 rounded-full bg-automotive-blue/20 flex items-center justify-center animate-pulse border border-automotive-blue/50" style="transform: rotate(${heading ?? 0}deg); transition: transform 0.2s linear;">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px #00C8FF);"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
           </div>`,
    iconSize: [48, 40],
    iconAnchor: [24, 20]
  });
};

export const Map = () => {
  const [destination, setDestination] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [roverPosition, setRoverPosition] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [missionStatus] = useState("WAITING FOR GPS");
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  const [gpsStatus, setGpsStatus] = useState<'searching' | 'connected' | 'unavailable'>('searching');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [initialCentered, setInitialCentered] = useState(false);
  const [mapTilesUnavailable, setMapTilesUnavailable] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const updateNetworkStatus = () => setNetworkOnline(navigator.onLine);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: locAccuracy } = position.coords;
        setRoverPosition([latitude, longitude]);
        setHeading(Number.isFinite(position.coords.heading) ? position.coords.heading : null);
        setSpeed(Number.isFinite(position.coords.speed) ? position.coords.speed! * 3.6 : null);
        setAccuracy(locAccuracy);
        setGpsStatus('connected');
      },
      (error) => {
        setGpsStatus('unavailable');
        if (error.code === error.PERMISSION_DENIED) {
           setToast({ message: 'Location permission denied.', type: 'error' });
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (gpsStatus === 'connected' && roverPosition && !initialCentered && mapRef) {
      mapRef.flyTo(roverPosition, 17, { animate: true, duration: 1.5 });
      setInitialCentered(true);
    }
  }, [gpsStatus, roverPosition, mapRef, initialCentered]);

  const handleCalculateRoute = () => {
    if (!destination) return;
    setToast({ message: 'Route planning is unavailable until a routing service is connected.', type: 'info' });
  };

  return (
    <div className="flex flex-col gap-10 font-sans pb-10 h-full max-w-screen-2xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[40px] font-[700] tracking-tight text-automotive-white leading-none mb-2">
            Mission Planning
          </h1>
          <div className="flex items-center gap-4 text-[15px] font-[400] text-automotive-muted">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${gpsStatus === 'connected' ? 'bg-automotive-green shadow-[0_0_8px_#3DFF53]' : gpsStatus === 'searching' ? 'bg-automotive-warning shadow-[0_0_8px_#FFC107]' : 'bg-automotive-danger shadow-[0_0_8px_#FF5252]'}`}></div>
              <span>Device GPS: {gpsStatus === 'connected' ? 'Connected' : gpsStatus === 'searching' ? 'Searching...' : 'Unavailable'}</span>
            </div>
            <div className="w-px h-4 bg-automotive-border"></div>
            <span>Signal: {networkOnline ? 'Online' : 'Offline'}</span>
            <div className="w-px h-4 bg-automotive-border"></div>
            <span className="text-automotive-blue uppercase font-[700] tracking-widest">{missionStatus}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button onClick={toggleFullscreen} className="flex items-center gap-2 bg-automotive-card hover:bg-white/5 border border-automotive-border px-6 h-12 rounded-[12px] text-[15px] font-[600] transition-colors focus:outline-none shadow-sm">
             {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
           </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isFullscreen ? '' : 'xl:grid-cols-12'} gap-6 items-stretch flex-1`} ref={mapContainerRef}>
        {/* Left Column: Global Map */}
        <div className={`flex flex-col min-h-[600px] h-[75vh] ${isFullscreen ? 'w-full h-screen fixed inset-0 z-50 p-8 bg-automotive-background' : 'xl:col-span-8'}`}>
          <BaseCard title="Global Navigation Map" icon={MapIcon}>
            <div className="flex-1 rounded-[8px] border border-automotive-border relative flex overflow-hidden z-0 shadow-inner group mt-2 min-h-[420px]">
            {roverPosition && gpsStatus === 'connected' && !mapTilesUnavailable ? <MapContainer 
              center={roverPosition}
              zoom={17} 
              className="w-full h-full"
              zoomControl={false}
              ref={setMapRef}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    eventHandlers={{ tileerror: () => setMapTilesUnavailable(true) }}
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite View">
                  <TileLayer
                    attribution='&copy; Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    eventHandlers={{ tileerror: () => setMapTilesUnavailable(true) }}
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Terrain View">
                  <TileLayer
                    attribution='&copy; OpenTopoMap'
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    eventHandlers={{ tileerror: () => setMapTilesUnavailable(true) }}
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              <ZoomControl position="bottomleft" />
              <ScaleControl position="bottomleft" />
              
              <Marker position={roverPosition} icon={getRoverIcon(heading)}>
                <Popup className="bg-automotive-card border border-automotive-border min-w-[200px] shadow-[0_0_20px_rgba(0,200,255,0.2)] rounded-lg">
                  <div className="flex flex-col gap-2 p-1">
                    <span className="text-automotive-blue font-[700] border-b border-automotive-border pb-2 text-[14px]">Device Location</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] pt-1">
                      <span className="text-automotive-muted font-[400]">LAT:</span>
                      <span className="text-white text-right font-display">{roverPosition[0].toFixed(5)}</span>
                      
                      <span className="text-automotive-muted font-[400]">LNG:</span>
                      <span className="text-white text-right font-display">{roverPosition[1].toFixed(5)}</span>
                      
                      <span className="text-automotive-muted font-[400]">Heading:</span>
                      <span className="text-automotive-warning text-right font-display">{heading === null ? 'N/A' : `${heading.toFixed(0)}°`}</span>
                      
                      <span className="text-automotive-muted font-[400]">Speed:</span>
                      <span className="text-white text-right font-display">{speed === null ? 'N/A' : `${speed.toFixed(1)} km/h`}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
            </MapContainer> : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-automotive-background p-6 text-center">
                <MapIcon className="w-8 h-8 text-automotive-muted" />
                <div>
                  <p className="text-[15px] font-[700] tracking-widest text-automotive-white">MAP DATA UNAVAILABLE</p>
                  <p className="mt-2 text-[13px] text-automotive-muted">GPS TELEMETRY {gpsStatus === 'connected' ? 'AVAILABLE' : gpsStatus.toUpperCase()}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-left text-[13px]">
                  <span className="text-automotive-muted">Latitude</span><span className="text-white">{roverPosition?.[0].toFixed(5) ?? 'N/A'}</span>
                  <span className="text-automotive-muted">Longitude</span><span className="text-white">{roverPosition?.[1].toFixed(5) ?? 'N/A'}</span>
                  <span className="text-automotive-muted">Heading</span><span className="text-white">{heading === null ? 'N/A' : `${heading.toFixed(0)}°`}</span>
                  <span className="text-automotive-muted">GPS status</span><span className="text-white uppercase">{gpsStatus}</span>
                  <span className="text-automotive-muted">Signal status</span><span className="text-white">{networkOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => roverPosition && mapRef?.flyTo(roverPosition, 17, { animate: true, duration: 1.5 })}
              className="absolute top-4 left-4 bg-automotive-card/90 backdrop-blur-md border border-automotive-border p-3 rounded-[12px] text-automotive-white hover:text-automotive-blue hover:border-automotive-blue transition-all z-[400] shadow-xl"
              title="Locate Me"
            >
              <LocateFixed className="w-5 h-5" />
            </button>

          </div>
          </BaseCard>

        </div>
        
        {/* Right Column: Mission Control Panel (Hide in Fullscreen) */}
        {!isFullscreen && (
          <div className="xl:col-span-4 flex flex-col gap-6 h-[75vh] min-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <BaseCard title="Mission Telemetry" icon={Activity} className="flex-shrink-0">
              <div className="flex flex-col gap-6 mt-2">
                <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col gap-2 transition-all hover:bg-white/5">
                  <div className="text-[13px] text-automotive-muted uppercase font-[600] tracking-widest">Active Objective</div>
                  <div className="text-[18px] text-white font-[600] tracking-tight">{missionStatus}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col justify-between gap-3 shadow-inner hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><Mountain className="w-4 h-4 text-automotive-green"/> Terrain</div>
                    <div className="text-white font-display text-[22px] font-[700] tracking-tight">WAITING FOR AI</div>
                  </div>
                  <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col justify-between gap-3 shadow-inner hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><Gauge className="w-4 h-4 text-automotive-blue"/> Speed</div>
                    <div className="text-white font-display text-[22px] font-[700] tracking-tight">{speed} <span className="text-[13px] text-automotive-muted font-sans font-[400] tracking-normal">km/h</span></div>
                  </div>
                  <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col justify-between gap-3 shadow-inner hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><Compass className="w-4 h-4 text-automotive-warning"/> Heading</div>
                    <div className="text-white font-display text-[22px] font-[700] tracking-tight">{heading === null ? 'N/A' : `${heading.toFixed(0)}°`}</div>
                  </div>
                  <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col justify-between gap-3 shadow-inner hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><Radio className="w-4 h-4 text-automotive-green"/> Signal</div>
                    <div className="text-white font-display text-[22px] font-[700] tracking-tight">{networkOnline ? 'ONLINE' : 'OFFLINE'}</div>
                  </div>
                </div>

                <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col gap-4 shadow-inner hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><Navigation2 className="w-4 h-4"/> Coordinates</div>
                    {accuracy && <span className="text-[11px] text-automotive-green font-[600]">± {accuracy.toFixed(1)}m</span>}
                  </div>
                  <div className="flex justify-between items-center border-b border-automotive-border pb-3">
                    <span className="text-[13px] text-automotive-muted font-[400]">LATITUDE</span>
                    <span className="text-white font-display font-[600] text-[16px]">{roverPosition?.[0].toFixed(5) ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-automotive-muted font-[400]">LONGITUDE</span>
                    <span className="text-white font-display font-[600] text-[16px]">{roverPosition?.[1].toFixed(5) ?? 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-automotive-background border border-automotive-border rounded-[8px] p-4 flex flex-col gap-3 shadow-inner hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-automotive-muted text-[13px] font-[600] uppercase tracking-wider"><BatteryIcon className="w-4 h-4 text-automotive-green"/> Power System</div>
                    <span className="text-automotive-muted font-display font-[700] text-[16px] tracking-tight">N/A</span>
                  </div>
                  <div className="h-2 w-full bg-automotive-card rounded-full overflow-hidden border border-automotive-border relative">
                    <div className="absolute top-0 bottom-0 left-0 bg-automotive-green transition-all shadow-[0_0_10px_#3DFF53]" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </BaseCard>

            <BaseCard title="Route Navigation" icon={Route} className="flex-shrink-0">
              <div className="flex flex-col gap-6 mt-2">
                <div className="relative">
                  <div className="absolute left-[15px] top-6 bottom-4 w-[2px] bg-automotive-border rounded-full"></div>
                  <div className="flex gap-4 items-center mb-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-automotive-blue flex items-center justify-center shrink-0 shadow-[0_0_10px_#00C8FF]">
                      <div className="w-3 h-3 rounded-full bg-automotive-black"></div>
                    </div>
                    <input type="text" value={roverPosition ? `${roverPosition[0].toFixed(5)}, ${roverPosition[1].toFixed(5)}` : 'Current Location: N/A'} readOnly className="w-full bg-automotive-background border border-automotive-border rounded-[8px] p-3 text-[14px] font-[500] text-automotive-white outline-none shadow-inner" />
                  </div>
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-automotive-green flex items-center justify-center shrink-0 shadow-[0_0_10px_#3DFF53]">
                      <Navigation2 className="w-4 h-4 text-automotive-background" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Destination..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-automotive-background border border-automotive-border rounded-[8px] p-3 text-[14px] font-[500] text-automotive-white outline-none placeholder:text-automotive-muted shadow-inner focus:border-automotive-blue transition-colors focus:shadow-[0_0_15px_rgba(0,200,255,0.1)]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCalculateRoute}
                  disabled={!destination}
                  className="w-full bg-automotive-blue text-automotive-background hover:bg-automotive-blue/90 h-12 rounded-[8px] uppercase tracking-widest text-[13px] font-[700] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(0,200,255,0.3)] mt-2"
                >
                  Calculate Route
                </button>
                <p className="text-[12px] text-automotive-muted">Route data unavailable</p>
              </div>
            </BaseCard>
          </div>
        )}
      </div>
      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type || 'info'} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
};
