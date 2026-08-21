import type { CSSProperties } from 'react'

/*
 * The skyline is deliberately built with CSS shapes rather than an image.
 * This keeps it sharp on every screen size and makes later colour or layout
 * adjustments easy.
 */

const clouds = [
  { left: '9%', top: '9%', width: 150 },
  { left: '26%', top: '18%', width: 120 },
  { left: '61%', top: '12%', width: 155 },
  { left: '79%', top: '24%', width: 115 },
]

const distantBuildings = [
  { left: '0%', width: '15%', height: '51%' },
  { left: '14%', width: '13%', height: '63%' },
  { left: '26%', width: '15%', height: '54%' },
  { left: '40%', width: '12%', height: '69%' },
  { left: '51%', width: '16%', height: '58%' },
  { left: '66%', width: '13%', height: '65%' },
  { left: '78%', width: '12%', height: '49%' },
  { left: '89%', width: '11%', height: '61%' },
]

const nearbyBuildings = [
  { left: '0%', width: '10%', height: '74%', windows: 5 },
  { left: '9%', width: '11%', height: '51%', windows: 4 },
  { left: '30%', width: '12%', height: '43%', windows: 4 },
  { left: '40%', width: '15%', height: '60%', windows: 6 },
  { left: '57%', width: '14%', height: '68%', windows: 5 },
  { left: '75%', width: '11%', height: '48%', windows: 4 },
  { left: '87%', width: '13%', height: '57%', windows: 5 },
]

export default function SkylineBackground() {
  return (
    /*
     * This entire component is decorative. Hiding it from assistive
     * technologies prevents dozens of meaningless building elements from
     * cluttering the accessibility tree.
     */
    <div
      className="bg-sky-blue pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft clouds provide depth without competing with the form. */}
      {clouds.map((cloud, index) => (
        <div
          key={`cloud-${index}`}
          className="bg-cloud-white/90 absolute h-10 rounded-full sm:h-12"
          style={
            {
              left: cloud.left,
              top: cloud.top,
              width: `${cloud.width}px`,
            } satisfies CSSProperties
          }
        />
      ))}

      {/* Lighter buildings sit farther away in the scene. */}
      {distantBuildings.map((building, index) => (
        <div
          key={`distant-building-${index}`}
          className="bg-building-far absolute bottom-0"
          style={
            {
              left: building.left,
              width: building.width,
              height: building.height,
            } satisfies CSSProperties
          }
        />
      ))}

      {/* Darker buildings sit in front and contain simplified windows. */}
      {nearbyBuildings.map((building, buildingIndex) => (
        <div
          key={`near-building-${buildingIndex}`}
          className="bg-building-near absolute bottom-0 overflow-hidden px-3 py-5"
          style={
            {
              left: building.left,
              width: building.width,
              height: building.height,
            } satisfies CSSProperties
          }
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {Array.from({ length: building.windows }).map((_, windowIndex) => (
              <span
                key={`window-${buildingIndex}-${windowIndex}`}
                className="bg-cloud-white block aspect-square min-h-3 min-w-3"
              />
            ))}
          </div>
        </div>
      ))}

      {/*
       * A subtle light overlay keeps the page close to the soft, low-contrast
       * quality of the wireframe.
       */}
      <div className="absolute inset-0 bg-white/5" />
    </div>
  )
}
