import { NextResponse } from "next/server";

// Serves the Chess Trainer APK only after a correct shared password.
//
// The repo is private, so the release asset is NOT anonymously downloadable.
// On a correct password we ask GitHub for the asset and hand back the
// short-lived signed URL it returns (the 159 MB file never streams through
// this function). Configure two env vars in Vercel:
//   CHESS_DOWNLOAD_PASSWORD  — the shared code you give to allowed people
//   GH_RELEASE_TOKEN         — a fine-grained PAT with Contents:Read on this repo

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OWNER = "jeremesaramosing05";
const REPO = "jereme-website";
const TAG = "chess-app-latest";
const ASSET = "chess-trainer-arm64.apk";

export async function POST(request: Request) {
  const expected = process.env.CHESS_DOWNLOAD_PASSWORD;
  const token = process.env.GH_RELEASE_TOKEN;
  if (!expected || !token) {
    return NextResponse.json(
      { error: "Downloads aren’t configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (password.length === 0 || password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "jereme-website",
  };

  // 1) Resolve the asset id from the release tag.
  const relRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`,
    { headers: { ...ghHeaders, Accept: "application/vnd.github+json" }, cache: "no-store" },
  );
  if (!relRes.ok) {
    return NextResponse.json({ error: "Release unavailable." }, { status: 502 });
  }
  const release = (await relRes.json()) as { assets?: Array<{ id: number; name: string }> };
  const asset = release.assets?.find((a) => a.name === ASSET);
  if (!asset) {
    return NextResponse.json({ error: "APK not found in the release." }, { status: 502 });
  }

  // 2) Ask for the asset; GitHub replies 302 with a short-lived signed URL.
  const assetRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${asset.id}`,
    { headers: { ...ghHeaders, Accept: "application/octet-stream" }, redirect: "manual" },
  );
  const location = assetRes.headers.get("location");
  if (!location) {
    return NextResponse.json({ error: "Could not produce a download link." }, { status: 502 });
  }

  return NextResponse.json({ url: location });
}
