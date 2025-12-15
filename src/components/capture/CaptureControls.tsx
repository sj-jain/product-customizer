import { useState, useRef, useEffect } from 'react';
import { Camera, Video, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CaptureControls() {
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get canvas element from DOM
  const getCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.querySelector('canvas');
    return canvas;
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Capture image from canvas
  const captureImage = async () => {
    setIsCapturingImage(true);
    try {
      // Get canvas element
      const canvas = getCanvas();
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Create a new canvas to capture
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = canvas.width;
      captureCanvas.height = canvas.height;
      const ctx = captureCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }

      // Draw the WebGL canvas to the 2D canvas
      ctx.drawImage(canvas, 0, 0);

      // Convert to blob and download
      captureCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-capture-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsCapturingImage(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing image:', error);
      setIsCapturingImage(false);
      alert('Failed to capture image. Please try again.');
    }
  };

  // Start video recording
  const startRecording = async () => {
    try {
      const canvas = getCanvas();
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Get canvas stream
      const stream = canvas.captureStream(30); // 30 FPS
      streamRef.current = stream;

      // Create MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      };

      // Fallback to VP8 if VP9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      // Fallback to default if VP8 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        options.mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-recording-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        chunksRef.current = [];
        setRecordingTime(0);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        stopRecording();
        alert('Recording error occurred. Please try again.');
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please try again.');
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {/* Image Capture Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={captureImage}
        disabled={isCapturingImage}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
        title="Capture Image"
      >
        {isCapturingImage ? (
          <Loader2 size={20} className="animate-spin text-blue-600" />
        ) : (
          <Camera size={20} className="text-blue-600" />
        )}
      </motion.button>

      {/* Video Recording Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex items-center justify-center w-12 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all border ${
          isRecording
            ? 'bg-red-600 text-white border-red-700'
            : 'bg-white text-gray-700 border-gray-200'
        }`}
        title={isRecording ? `Stop Recording (${formatTime(recordingTime)})` : 'Start Recording'}
      >
        {isRecording ? (
          <Square size={20} className="fill-current" />
        ) : (
          <Video size={20} className="text-red-600" />
        )}
      </motion.button>

      {/* Recording Indicator - Only show timer when recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 right-0 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-medium">{formatTime(recordingTime)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CaptureControls;

