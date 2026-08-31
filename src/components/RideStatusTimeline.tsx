import React from 'react';

const STEPS = [
  { key: 'requested', label: 'Requested', desc: 'Finding driver' },
  { key: 'accepted', label: 'Accepted', desc: 'Driver on the way' },
  { key: 'started', label: 'In ride', desc: 'Heading to dropoff' },
  { key: 'completed', label: 'Done', desc: 'Pay cash' },
];

const order = ['requested', 'accepted', 'started', 'completed'];

interface Props {
  status: string;
}

const RideStatusTimeline: React.FC<Props> = ({ status }) => {
  const currentIdx = order.indexOf(status);

  return (
    <div className="flex justify-between items-start mb-4 px-1">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 relative">
            {idx < STEPS.length - 1 && (
              <div
                className={`absolute top-3 left-1/2 w-full h-0.5 ${idx < currentIdx ? 'bg-primary' : 'bg-gray-200'}`}
                style={{ zIndex: 0 }}
              />
            )}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                done ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              } ${active ? 'ring-4 ring-primary/30 scale-110' : ''}`}
            >
              {done ? '✓' : idx + 1}
            </div>
            <p className={`text-[10px] mt-1 text-center leading-tight ${active ? 'font-bold text-primary' : 'text-gray-500'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RideStatusTimeline;
