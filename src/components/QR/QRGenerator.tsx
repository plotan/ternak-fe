import React, { useRef } from 'react';
import * as QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QRGeneratorProps {
  value: string;
  label: string;
  size?: number;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ value, label, size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [value, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `QR_Kambing_${value}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
      <button
        onClick={downloadQR}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Download QR Code</span>
      </button>
    </div>
  );
};

export default QRGenerator;