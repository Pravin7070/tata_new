import { useRef, useState, useEffect } from 'react';
import { Video, Settings2, Upload } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';

export interface VideoPlayerProps {
  status: string;
  resolution: string;
  fps: number | null;
  source: string;
  streamUrl?: string | null;
  boundingBoxes?: any[];
  onSwitchCamera?: () => void;
  onSettingsClick?: () => void;
}

export const VideoPlayer = ({ status, resolution, fps, source, boundingBoxes, onSettingsClick }: VideoPlayerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [cameraDisconnected, setCameraDisconnected] = useState(false);
  const hasUploadedSource = Boolean(videoUrl);
  const hasVideoSource = hasUploadedSource || !cameraDisconnected;
  const unavailableStatus = cameraDisconnected ? 'CAMERA DISCONNECTED' : /offline/i.test(status) ? 'CAMERA OFFLINE' : 'WAITING FOR CAMERA';

  useEffect(() => {
    if (!cameraDisconnected || hasUploadedSource) return;

    const retryTimer = window.setTimeout(() => setCameraDisconnected(false), 3000);
    return () => window.clearTimeout(retryTimer);
  }, [cameraDisconnected, hasUploadedSource]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLiveCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setMediaType(null);
    setCameraDisconnected(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('http://localhost:8000/start-inference', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
  <BaseCard title="LIVE CAMERA FEED" icon={Video} className="h-full flex flex-col">
    <div className="flex-1 bg-automotive-black rounded-lg border border-automotive-gray/30 overflow-hidden relative group min-h-[300px] w-full h-full">
      {hasUploadedSource ? (
        <>
          {mediaType === 'image' ? (
            <img 
              src={videoUrl || undefined}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Uploaded media"
            />
          ) : (
            <video 
              ref={videoRef}
              src={videoUrl || undefined} 
              autoPlay 
              loop
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {boundingBoxes && boundingBoxes.map((det, idx) => {
            const bbox = det.bbox;
            if (!bbox || bbox.w === undefined) return null;
            return (
              <div
                key={idx}
                className="absolute border-2 border-[#39FF14] bg-[#39FF14]/10 pointer-events-none"
                style={{
                  left: `${bbox.x * 100}%`,
                  top: `${bbox.y * 100}%`,
                  width: `${bbox.w * 100}%`,
                  height: `${bbox.h * 100}%`
                }}
              >
                <div className="absolute -top-5 left-0 bg-[#39FF14]/80 text-black text-[10px] font-mono px-1 font-bold whitespace-nowrap">
                  {det.class || 'Object'} {(det.confidence * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </>
      ) : !cameraDisconnected ? (
        <img
          src="http://10.245.109.97:8000/camera"
          className="absolute inset-0 w-full h-full object-contain"
          alt="Raspberry Pi live camera stream"
          onLoad={() => setCameraDisconnected(false)}
          onError={() => setCameraDisconnected(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-automotive-muted">
          <Video className="w-8 h-8 opacity-60" />
          <span className="text-[12px] font-[600] tracking-[0.16em]">{unavailableStatus}</span>
        </div>
      )}
      
      {/* Overlays */}
      <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-2 border border-automotive-gray/30 text-automotive-white font-mono">
        <span className={`w-2 h-2 rounded-full ${hasVideoSource ? 'bg-automotive-green animate-pulse' : 'bg-automotive-muted'}`}></span>
        {hasVideoSource ? (hasUploadedSource ? 'MEDIA LOADED' : 'LIVE') : unavailableStatus} | {resolution} | {fps === null ? 'N/A' : `${fps} FPS`}
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="bg-black/80 px-3 py-1.5 rounded border border-automotive-blue/50 text-automotive-blue text-[10px] uppercase tracking-widest font-mono">
          {source}
        </div>
        <button onClick={onSettingsClick} className="bg-black/60 p-2.5 rounded-full border border-automotive-gray/30 text-automotive-white hover:bg-automotive-blue hover:border-automotive-blue cursor-pointer transition-colors flex items-center justify-center">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
      
    </div>
    
    <div className="mt-6 flex gap-4 w-full max-w-md mx-auto">
      <input
        type="file"
        accept="video/*,image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button 
        onClick={handleUploadClick}
        className="flex-1 h-11 bg-automotive-blue hover:bg-automotive-blue/80 text-automotive-white border border-automotive-blue rounded text-[13px] tracking-widest uppercase transition-colors font-[600] flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" /> Upload Media
      </button>
      <button 
        onClick={handleLiveCamera}
        className="flex-1 h-11 bg-automotive-dark hover:bg-automotive-gray/20 text-automotive-white border border-automotive-gray/30 rounded text-[13px] tracking-widest uppercase transition-colors font-[600] flex items-center justify-center"
      >
        Live Camera
      </button>
    </div>
  </BaseCard>
  );
};
