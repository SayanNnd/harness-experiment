import type { CSSProperties } from 'react'

/** Original line illustration, deliberately decorative rather than a data graphic. */
export default function RoomArt({ active = false }: { active?: boolean }) {
  return <div className={`room-art ${active ? 'room-awake' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 600 600" fill="none"><defs><radialGradient id="room-halo"><stop stopColor="#b5c38a" stopOpacity=".19"/><stop offset="1" stopColor="#b5c38a" stopOpacity="0"/></radialGradient><linearGradient id="room-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9fae7a" stopOpacity=".27"/><stop offset="1" stopColor="#5b7050" stopOpacity=".02"/></linearGradient></defs>
      <circle cx="300" cy="260" r="250" fill="url(#room-halo)"/>
      <g className="room-architecture" stroke="#a4b385" strokeOpacity=".13" strokeWidth="1"><path d="M110 560V235a190 190 0 0 1 380 0v325"/><path d="M126 560V235a174 174 0 0 1 348 0v325"/><path d="M300 45v110M110 300h70m240 0h70"/><circle cx="300" cy="260" r="214" strokeDasharray="1 11"/><path d="M70 480q115-100 230-28t230-21M55 510q145-110 290-12t200-14M42 540q130-80 270-9t245-35"/></g>
      <g className="botanical botanical-left" stroke="#9daa7f" strokeWidth="1.1"><path d="M131 600Q200 451 107 309"/><path d="M151 543Q58 542 69 451q72 17 82 92ZM158 492Q212 454 191 400q-53 24-33 92ZM140 438Q61 428 72 360q59 22 68 78ZM123 373q41-37 21-78-37 29-21 78Z" fill="url(#room-leaf)"/><path d="M151 543 83 470m75 22 25-71m-43 17-55-59m38-6 17-60" strokeOpacity=".5"/></g>
      <g className="botanical botanical-right" stroke="#9daa7f" strokeWidth="1"><path d="M468 600q-53-131 34-257"/><path d="M454 543q90-6 87-85-65 19-87 85ZM458 493q-61-22-51-84 49 23 51 84ZM479 423q70-1 69-62-51 16-69 62ZM494 374q-36-38-17-72 27 25 17 72Z" fill="url(#room-leaf)"/></g>
      <g className="room-stars" fill="#d5d9ad"><circle cx="124" cy="191" r="1.4"/><circle cx="464" cy="163" r="1"/><circle cx="390" cy="91" r="1.5"/><circle cx="191" cy="121" r="1"/><circle cx="528" cy="315" r="1.2"/><path d="m173 250 3-6 2 6 6 2-6 2-2 6-3-6-5-2ZM420 359l2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/></g>
    </svg>
    {Array.from({ length: 9 }, (_, index) => <i key={index} className="firefly" style={{ '--i': index, left: `${13 + index * 9}%`, top: `${28 + (index * 17) % 58}%` } as CSSProperties}/>)}
  </div>
}
