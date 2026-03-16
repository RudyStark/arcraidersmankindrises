"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface VoteLocation {
  lat: number;
  lng: number;
}

export default function WorldMap({ votes }: { votes: VoteLocation[] }) {
  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto" }}>
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <filter id="continent-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur-wide" />
            <feColorMatrix
              in="blur-wide"
              type="matrix"
              values="0.6 0.6 1 0 0  0.6 0.6 1 0 0  1 1 1 0 0  0 0 0 0.6 0"
              result="halo"
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur-tight" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="blur-tight" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0.6 0 0 0  0.4 0.2 0 0 0  0 0 0 0 0  0 0 0 1.5 0"
              result="orange-glow"
            />
            <feMerge>
              <feMergeNode in="orange-glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="transparent"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={0.5}
                filter="url(#continent-glow)"
                style={{
                  default: { outline: "none" },
                  hover:   { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {votes.map((vote, i) => (
          <Marker key={i} coordinates={[vote.lng, vote.lat]}>
            <circle r={6} fill="rgba(249,115,22,0.15)" filter="url(#dot-glow)" />
            <circle r={2.5} fill="#fb923c" />
            <circle r={1} fill="#fff" />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
