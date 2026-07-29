export default function GrainOverlay() {
  return (
    <div className="grain-layer animate-grain" aria-hidden="true">
      <svg>
        <filter id="gychat-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gychat-noise)" />
      </svg>
    </div>
  )
}
