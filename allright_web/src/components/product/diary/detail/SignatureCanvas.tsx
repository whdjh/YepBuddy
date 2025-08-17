"use client";

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/common/Button';

interface SignatureCanvasProps {
  onSave?: (signatureData: string) => void;
  className?: string;
}

export default function SignatureCanvas({ onSave, className = "" }: SignatureCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = '#16a34a';
    context.lineWidth = 2;
    contextRef.current = context;
  }, []);

  const handleStartDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // 스크롤 방지
    setIsDrawing(true);
    handleDraw(event);
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
  };

  const handleDraw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // 스크롤 방지
    if (!isDrawing || !contextRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    
    if ('touches' in event) {
      // 터치 이벤트
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      // 마우스 이벤트
      const rect = canvas.getBoundingClientRect();
      clientX = event.clientX - rect.left;
      clientY = event.clientY - rect.top;
    }

    contextRef.current.lineTo(clientX, clientY);
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX, clientY);
  };

  const handleClearSignature = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    
    if (onSave) {
      onSave(signatureData);
    } else {
      console.log('Signature saved:', signatureData);
    }
  };

  return (
    <div className={className}>
      <div className="mb-2.5">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-20 border border-gray-600 rounded bg-white cursor-crosshair touch-none"
            onMouseDown={handleStartDrawing}
            onMouseUp={handleFinishDrawing}
            onMouseOut={handleFinishDrawing}
            onMouseMove={handleDraw}
            onTouchStart={handleStartDrawing}
            onTouchEnd={handleFinishDrawing}
            onTouchMove={handleDraw}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleClearSignature}
          className="h-[2rem] text-sm w-[10rem]"
        >
          지우기
        </Button>
        <Button
          variant="solid"
          onClick={handleSaveSignature}
          className="h-[2rem] text-sm w-[10rem]"
        >
          저장
        </Button>
      </div>
    </div>
  );
}
