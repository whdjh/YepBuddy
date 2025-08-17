"use client";

import { useState, useRef, useEffect } from 'react';
import Button from './Button';

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

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(event);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
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

  const clearSignature = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
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
            className="w-full h-20 border border-gray-600 rounded bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseOut={finishDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={clearSignature}
          className="h-[2rem] text-sm w-[10rem]"
        >
          지우기
        </Button>
        <Button
          variant="solid"
          onClick={saveSignature}
          className="h-[2rem] text-sm w-[10rem]"
        >
          저장
        </Button>
      </div>
    </div>
  );
}
