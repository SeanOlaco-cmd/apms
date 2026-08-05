import { useEffect, useState } from "react";

export default function VPAANstp() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">NSTP Reports 🌿</h1>
        <p className="text-red-200 text-sm mt-1">NSTP data submitted by the NSTP Head.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-400 text-sm">NSTP reports will appear here once the NSTP Head submits data.</p>
      </div>
    </div>
  );
}