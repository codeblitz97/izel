import { NextRequest, NextResponse } from "next/server";
import ky from "ky";
import { getAnimeEpisodeSources } from "aniwatch";
import { ANIME, StreamingServers } from "@consumet/extensions";

import { anify, cache } from "@/lib/anime";
import { AnifyData, GogoAnimeData } from "@/types/sources";

export const revalidate = 0;

const bky = ky.create({
  timeout: 11000,
});

const getHiAnime = async (episodeId: string, subType: "sub" | "dub") => {
  const cacheKey = `hiAnime-${episodeId}`;

  const cached = cache.get(cacheKey) as string;

  if (cached) {
    return JSON.parse(cached) as any;
  }

  const res = await getAnimeEpisodeSources(episodeId, "hd-1", subType);

  cache.set(cacheKey, JSON.stringify(res), 60 * 60);

  return res;
};

const getAnify = async (
  provider: "9anime" | "sudatchi" | "animepahe",
  id: string,
  episodeNumber: string,
  subType: "sub" | "dub",
  watchId: string,
) => {
  const cacheKey = `anify-${provider}-${id}-${episodeNumber}-${subType}`;

  const cached = cache.get(cacheKey) as string;

  if (cached) {
    return JSON.parse(cached) as AnifyData;
  }

  const res = await anify.get(
    `sources?providerId=${provider}&watchId=${watchId}&id=${id}&episodeNumber=${episodeNumber}&subType=${subType}`,
  );

  const data = await res.json();

  cache.set(cacheKey, JSON.stringify(data), 60 * 60);

  return data as AnifyData;
};

const getGogoAnime = async (id: string) => {
  const gg = new ANIME.Gogoanime("anitaku.pe");
  const cacheKey = `gogoAnime-${id}`;

  const cached = cache.get(cacheKey) as string;

  if (cached) {
    return JSON.parse(cached) as GogoAnimeData;
  }

  const res = await gg.fetchEpisodeSources(id, StreamingServers.GogoCDN);

  cache.set(cacheKey, JSON.stringify(res), 60 * 60);

  return res as GogoAnimeData;
};

export const GET = async (
  _request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;

  const searchParams = new URL(_request.url).searchParams;

  const episodeNumber = searchParams.get("episodeNumber")!;
  const subType = searchParams.get("subType")!;
  const provider = searchParams.get("provider")!;
  let watchId = searchParams.get("watchId")!;

  if (provider === "hianime" && watchId.includes("watch"))
    watchId = decodeURIComponent(watchId).split("watch/")[1];

  if (provider === "hianime") {
    const data = await getHiAnime(
      decodeURIComponent(watchId),
      subType as "sub" | "dub",
    );

    const parsedSources = data.sources.map((src: any) => ({
      url: src.url,
      quality: "default",
    }));

    const parsedSubtitles = data.tracks.map((track: any) => ({
      url: track.file,
      lang: track.label ? track.label.substring(0, 2).toLowerCase() : null,
      label: track.label ? track.label : track.kind,
    }));

    return NextResponse.json({
      sources: parsedSources,
      subtitles: parsedSubtitles,
    });
  } else if (provider === "gogoanime") {
    const data = await getGogoAnime(watchId);

    console.log(data);

    const parsedData = data.sources.map((src) => ({
      quality: src.quality,
      url: src.url,
    }));

    return NextResponse.json({ sources: parsedData, subtitles: [] });
  } else if (provider === "sudatchi") {
    const data = await getAnify(
      "sudatchi",
      id,
      episodeNumber,
      subType as "sub" | "dub",
      watchId,
    );

    const parsedSources = data.sources.map((src) => ({
      quality: src.quality,
      url: `http://100.42.190.249:3030/m3u8-proxy?url=${encodeURIComponent(src.url)}&headers=${encodeURIComponent(
        JSON.stringify({
          referer: "https://sudatchi.com",
        }),
      )}`,
    }));

    const parsedSubtitles = data.subtitles?.map((sub) => ({
      url: sub.url,
      lang: sub.lang,
      label: sub.label,
    }));

    return NextResponse.json({
      sources: parsedSources,
      subtitles: parsedSubtitles,
    });
  } else if (provider === "9anime") {
    const data = await getAnify(
      "9anime",
      id,
      episodeNumber,
      subType as "sub" | "dub",
      watchId,
    );

    const parsedSources = data.sources.map((src) => ({
      quality: src.quality,
      url: `http://100.42.190.249:3030/m3u8-proxy?url=${encodeURIComponent(src.url)}&headers=${JSON.stringify({ referer: "https://aniwave.to" })}`,
    }));

    const parsedSubtitles = data.subtitles?.map((sub) => ({
      url: sub.url,
      lang: sub.lang,
      label: sub.label,
    }));

    return NextResponse.json({
      sources: parsedSources,
      subtitles: parsedSubtitles,
    });
  } else if (provider === "animepahe") {
    const data = await getAnify(
      "animepahe",
      id,
      episodeNumber,
      subType as "sub" | "dub",
      watchId,
    );

    const parsedSources = data.sources.map((src) => ({
      quality: src.quality,
      url: src.url,
    }));

    const parsedSubtitles = data.subtitles?.map((sub) => ({
      url: sub.url,
      lang: sub.lang,
      label: sub.label,
    }));

    return NextResponse.json({
      sources: parsedSources,
      subtitles: parsedSubtitles,
    });
  } else {
    return NextResponse.json({
      sources: [],
      subtitles: [],
    });
  }
};
