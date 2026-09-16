"use client";

import * as React from "react";
import type { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { TssCacheProvider } from "tss-react";
import { createEmotionCacheApp, createEmotionCacheMui } from "@/libs";

type InsertedStyle = {
  name: string;
  isGlobal: boolean;
};

type EmotionCacheRegistry = {
  cache: EmotionCache;
  flush: () => InsertedStyle[];
};

type StylePayload = {
  dataEmotion: string;
  css: string;
};

const createEmotionCacheRegistry = (createCache: () => EmotionCache): EmotionCacheRegistry => {
  const cache = createCache();
  const previousInsert = cache.insert;
  let insertedStyles: InsertedStyle[] = [];

  cache.compat = true;
  cache.insert = (selector, serialized, sheet, shouldCache) => {
    if (cache.inserted[serialized.name] === undefined) {
      insertedStyles.push({ name: serialized.name, isGlobal: selector === "" });
    }

    return previousInsert(selector, serialized, sheet, shouldCache);
  };

  return {
    cache,
    flush: () => {
      const styles = insertedStyles;
      insertedStyles = [];
      return styles;
    },
  };
};

const getInsertedCss = (cache: EmotionCache, name: string): string => {
  const css = cache.inserted[name];
  return typeof css === "string" ? css : "";
};

const buildStylePayloads = (cache: EmotionCache, insertedStyles: InsertedStyle[]): StylePayload[] => {
  const globals: StylePayload[] = [];
  let dataEmotion = cache.key;
  let css = "";

  insertedStyles.forEach(({ name, isGlobal }) => {
    const insertedCss = getInsertedCss(cache, name);
    if (!insertedCss) return;
    if (isGlobal) globals.push({ dataEmotion: `${cache.key}-global ${name}`, css: insertedCss });
    else {
      dataEmotion = `${dataEmotion} ${name}`;
      css = `${css}${insertedCss}`;
    }
  });

  return css ? [...globals, { dataEmotion, css }] : globals;
};

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache: emotionCacheMui, flush: flushMuiStyles }] = React.useState(() => createEmotionCacheRegistry(createEmotionCacheMui));
  const [{ cache: emotionCacheApp, flush: flushAppStyles }] = React.useState(() => createEmotionCacheRegistry(createEmotionCacheApp));

  useServerInsertedHTML(() => {
    const stylePayloads = [
      ...buildStylePayloads(emotionCacheMui, flushMuiStyles()),
      ...buildStylePayloads(emotionCacheApp, flushAppStyles()),
    ];

    if (!stylePayloads.length) return null;

    return (
      <React.Fragment>
        {stylePayloads.map(({ dataEmotion, css }) => (
          <style key={dataEmotion} data-emotion={dataEmotion} dangerouslySetInnerHTML={{ __html: css }} />
        ))}
      </React.Fragment>
    );
  });

  return (
    <CacheProvider value={emotionCacheMui}>
      <TssCacheProvider value={emotionCacheApp}>{children}</TssCacheProvider>
    </CacheProvider>
  );
}
