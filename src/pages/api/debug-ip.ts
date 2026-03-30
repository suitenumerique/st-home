import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({
    "x-forwarded-for": req.headers["x-forwarded-for"],
    "x-real-ip": req.headers["x-real-ip"],
    "x-geo-country": req.headers["x-geo-country"],
    remoteAddress: req.socket.remoteAddress,
    allHeaders: req.headers,
  });
}
