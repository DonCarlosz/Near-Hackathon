import React, { useState } from 'react';
import { useVoiceLeash } from '../context/VoiceLeashContext';

export default function PurchaseHistory() {
  const { history } = useVoiceLeash();
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  const downloadFile = (deliverable, filename, type) => {
    let content = '';
    let mimeType = 'text/plain';

    if (type === 'json' || typeof deliverable === 'object') {
      content = JSON.stringify(deliverable, null, 2);
      mimeType = 'application/json';
    } else {
      content = String(deliverable);
      mimeType = type === 'csv' ? 'text/csv' : 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Category header */}
      <div className="font-mono text-xs font-bold text-[#0047FF] tracking-wider uppercase">
        03 / AUDIT LOG & DELIVERABLES
      </div>

      <div className="border-b border-[#D8CFBC] pb-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
          PURCHASE HISTORY &<br />
          <span className="text-[#0047FF]">ON-CHAIN AUDIT TRAIL</span>
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#555] mt-2 max-w-xl leading-relaxed">
          Verifiable record of capabilities purchased under the policy leash. Inspect and export payloads acquired by the agent.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="border border-[#D8CFBC] p-12 text-center bg-[#EFE9DC] font-mono text-xs text-[#777]">
          [ NO PURCHASES RECORDED YET. GO TO SHOP TO INITIATE AN AGENT RUN. ]
        </div>
      ) : (
        <div className="border-t border-l border-[#D8CFBC] overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs bg-[#EFE9DC]">
            <thead>
              <tr className="border-b border-[#D8CFBC] text-[10px] text-[#888] uppercase">
                <th className="py-3 px-4 border-r border-[#D8CFBC]">[ ITEM ACQUIRED ]</th>
                <th className="py-3 px-4 border-r border-[#D8CFBC]">[ PRICE ]</th>
                <th className="py-3 px-4 border-r border-[#D8CFBC]">[ APPROVAL PATH ]</th>
                <th className="py-3 px-4 border-r border-[#D8CFBC]">[ TIME ]</th>
                <th className="py-3 px-4 border-r border-[#D8CFBC]">[ ON-CHAIN TX ]</th>
                <th className="py-3 px-4 text-right border-r border-[#D8CFBC]">[ DELIVERABLE ]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8CFBC]">
              {history.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#EAE3D4] transition-colors">
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] font-bold text-[#111111]">
                    {tx.productName}
                  </td>
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] text-[#0047FF] font-bold">
                    {tx.price} NEAR
                  </td>
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] text-[#444]">
                    {tx.approvedBy}
                  </td>
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] text-[#777]">
                    {tx.timestamp}
                  </td>
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] text-[#0047FF]">
                    {tx.txHash?.startsWith('auton-') ? (
                      <a
                        href="https://testnet.nearblocks.io/address/policy.voiceleash.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-emerald-700 font-bold"
                        title="Autonomous execution under policy.voiceleash.testnet"
                      >
                        [ AUTON LEASH ] ↗
                      </a>
                    ) : (
                      <a
                        href={`https://testnet.nearblocks.io/txns/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        {tx.txHash?.length > 16 ? `${tx.txHash.slice(0, 14)}...` : tx.txHash} ↗
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 border-r border-[#D8CFBC] text-right">
                    <button
                      onClick={() => setSelectedDeliverable(tx)}
                      className="text-[#0047FF] hover:underline font-bold uppercase"
                    >
                      Inspect ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deliverable Payload Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#EFE9DC] border border-[#D8CFBC] w-full max-w-2xl shadow-2xl flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[#D8CFBC]">
              <div className="font-bold text-[#111111] uppercase">
                [ PAYLOAD: {selectedDeliverable.productName} ]
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="font-bold text-[#555] hover:text-black"
              >
                [ CLOSE ✕ ]
              </button>
            </div>

            <div className="p-4 bg-[#111111] text-emerald-400 overflow-y-auto max-h-96">
              <pre className="whitespace-pre-wrap">
                {typeof selectedDeliverable.deliverable === 'object'
                  ? JSON.stringify(selectedDeliverable.deliverable, null, 2)
                  : String(selectedDeliverable.deliverable)}
              </pre>
            </div>

            <div className="p-4 border-t border-[#D8CFBC] flex items-center justify-between">
              <span className="text-[10px] text-[#777]">Delivered directly to agent runtime</span>
              <button
                onClick={() => downloadFile(
                  selectedDeliverable.deliverable,
                  `${selectedDeliverable.productName.toLowerCase().replace(/\s+/g, '-')}.${typeof selectedDeliverable.deliverable === 'object' ? 'json' : 'csv'}`,
                  typeof selectedDeliverable.deliverable === 'object' ? 'json' : 'csv'
                )}
                className="px-4 py-2 bg-[#111111] hover:bg-[#0047FF] text-white font-bold uppercase transition-colors"
              >
                Download Export ↗
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
