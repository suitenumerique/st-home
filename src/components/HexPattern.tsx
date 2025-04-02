"use client";

export default function HexPattern() {
  // Calculate positions for hexagons
  const getHexPosition = (leftOffset: number, direction: string, row: number, col: number) => {
    const hexWidth = 56.5; // Width of a single hexagon
    const hexHeight = 64.5; // Height of a single hexagon
    const horizontalOffset = hexWidth * 1; // Overlap for hex grid
    const verticalOffset = hexHeight * 1; // Vertical spacing

    const coords: { [key: string]: number } = {};
    coords[direction] = leftOffset + col * horizontalOffset + (row % 2) * (hexWidth / 2);
    coords["top"] = (row * verticalOffset) / 2 - (row % 2) * (hexHeight / 4); // + (row % 2) * (hexHeight / 2) - (Math.floor(row/2) % 2) * (hexHeight / 4),
    return coords;
  };

  return (
    <>
      {/* Right hexagon grid container */}
      <div
        style={{
          position: "absolute",
          top: -23,
          left: "50%",
          width: "100%",
          height: "100%",
          opacity: 1,
          zIndex: 0,
        }}
      >
        {[
          [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ].map((row, rowIndex) =>
          row.map(
            (cell, colIndex) =>
              cell === 1 && (
                <svg
                  key={`hex-${rowIndex}-${colIndex}`}
                  width="60"
                  height="66"
                  viewBox="-0.5 -0.5 60 66"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "absolute",
                    ...getHexPosition(200, "left", rowIndex, colIndex),
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M26.269 0.873C27.444 0.187 28.894 0.187 30.072 0.873C35.205 3.823 49.305 11.963 54.438 14.936C55.616 15.622 56.338 16.857 56.338 18.229C56.338 24.151 56.338 40.432 56.338 46.355C56.338 47.704 55.616 48.962 54.438 49.648C49.305 52.62 35.205 60.738 30.072 63.71C28.894 64.396 27.444 64.396 26.269 63.71C21.136 60.738 7.0356 52.62 1.9031 49.648C0.7252 48.962 0.0002 47.704 0.0002 46.355C0.0002 40.432 0.0002 24.151 0.0002 18.229C0.0002 16.857 0.7252 15.622 1.9031 14.936C7.0356 11.963 21.136 3.823 26.269 0.873Z"
                    stroke="#DFDFFB"
                    strokeWidth="1"
                    strokeMiterlimit="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
          ),
        )}
      </div>

      {/* Left hexagon grid container */}
      <div
        style={{
          position: "absolute",
          top: -23,
          left: "0%",
          width: "50%",
          height: "100%",
          opacity: 1,
          zIndex: 0,
        }}
      >
        {[
          [],
          [],
          [],
          [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ].map((row, rowIndex) =>
          row.map(
            (cell, colIndex) =>
              cell === 1 && (
                <svg
                  key={`hex-${rowIndex}-${colIndex}`}
                  width="60"
                  height="66"
                  viewBox="-0.5 -0.5 60 66"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: "absolute",
                    ...getHexPosition(200, "right", rowIndex, colIndex),
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M26.269 0.873C27.444 0.187 28.894 0.187 30.072 0.873C35.205 3.823 49.305 11.963 54.438 14.936C55.616 15.622 56.338 16.857 56.338 18.229C56.338 24.151 56.338 40.432 56.338 46.355C56.338 47.704 55.616 48.962 54.438 49.648C49.305 52.62 35.205 60.738 30.072 63.71C28.894 64.396 27.444 64.396 26.269 63.71C21.136 60.738 7.0356 52.62 1.9031 49.648C0.7252 48.962 0.0002 47.704 0.0002 46.355C0.0002 40.432 0.0002 24.151 0.0002 18.229C0.0002 16.857 0.7252 15.622 1.9031 14.936C7.0356 11.963 21.136 3.823 26.269 0.873Z"
                    stroke="#DFDFFB"
                    strokeWidth="1"
                    strokeMiterlimit="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
          ),
        )}
      </div>
    </>
  );
}
