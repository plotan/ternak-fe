import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check camera permission on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Check permissions without actually accessing the camera
        const permissionStatus = await navigator.permissions?.query({ name: 'camera' as PermissionName });
        if (permissionStatus) {
          if (permissionStatus.state === 'granted') {
            setHasPermission(true);
            setError(null);
            return;
          } else if (permissionStatus.state === 'denied') {
            setHasPermission(false);
            setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
            return;
          }
        }
        
        // Fallback: try to access camera briefly
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment' // Prefer back camera on mobile
            } 
          });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
          setError(null);
        } catch (streamError) {
          throw streamError;
        }
      } else {
        setHasPermission(false);
        setError('Camera tidak didukung di browser ini');
      }
    } catch (err) {
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan di perangkat ini.');
        } else {
          setError('Gagal mengakses kamera: ' + err.message);
        }
      } else {
        setError('Gagal mengakses kamera');
      }
    }
  };
  useEffect(() => {
    if (isScanning) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: {
            width: Math.min(250, window.innerWidth - 40),
            height: Math.min(250, window.innerWidth - 40),
          },
          fps: isMobile ? 5 : 10, // Lower FPS on mobile for better performance
          rememberLastUsedCamera: true,
          supportedScanTypes: [],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: 'environment', // Prefer back camera
            advanced: [{
              focusMode: 'continuous',
              whiteBalanceMode: 'continuous'
            }]
          }
        },
        false
      );

      scanner.render(
        (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScan(decodedText);
          scanner.clear();
          setIsScanning(false);
          setError(null);
        },
        (error: string) => {
          // Only log actual errors, not scanning attempts
          if (!error.includes('No QR code found') && !error.includes('QR code parse error')) {
            console.log('QR Scan Error:', error);
            // Don't show error for common scanning states
            if (error.includes('Camera stream not available') || error.includes('Unable to start camera')) {
              setError('Gagal memulai kamera. Pastikan kamera tidak digunakan aplikasi lain.');
            }
          }
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning, onScan]);

  const startScanning = async () => {
    setError(null);
    
    // Re-check permission if previously denied
    if (hasPermission === false) {
      await checkCameraPermission();
    }
    
    // Only start scanning if we have permission or permission is unknown
    if (hasPermission !== false) {
      // Add a small delay to ensure camera is ready, especially on mobile
      setTimeout(() => {
        setIsScanning(true);
      }, 100);
    }
  };
  if (!isScanning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Scan QR Code</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                  {hasPermission === false && (
                    <button
                      onClick={checkCameraPermission}
                      className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                    >
                      Coba lagi
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {hasPermission === false 
              ? 'Akses kamera diperlukan untuk memindai QR code'
              : 'Klik tombol di bawah untuk mulai memindai QR code'
            }
          </p>
          
          <button
            onClick={startScanning}
            disabled={hasPermission === false}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{hasPermission === false ? 'Akses Kamera Ditolak' : 'Mulai Scan'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Scanning QR Code</h3>
          <button
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
              setIsScanning(false);
              setError(null);
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col p-4">
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-center">
            <div id="qr-reader" className="w-full max-w-sm"></div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Arahkan kamera ke QR code untuk memindai. Pastikan QR code terlihat jelas dan dalam pencahayaan yang cukup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;