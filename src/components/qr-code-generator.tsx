"use client";

import { QRCodeSVG } from "qrcode.react";

export default function QRCodeGenerator({ value }: { value: string }) {
  return (
    <div className="w-full flex justify-center items-center">
      <QRCodeSVG
        value={value}
        size={273}
        target="_blank"
        fgColor="#000000"
        bgColor="#ffffff"
        level="M"
      />
    </div>
  );
}
