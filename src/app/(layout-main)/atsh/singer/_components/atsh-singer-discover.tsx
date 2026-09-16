"use client";

import { ProductInfoSliderComponent } from "@/components";
import { Box } from "@mui/material";
import { ATSH_SINGER_DISCOVER_ACTION_LABEL, type AtshSingerDiscoverCard } from "../_constants/atsh-singer.constants";
import useAtshSingerStyles from "./atsh-singer.styles";

type AtshSingerDiscoverProps = {
  title: string;
  cards: AtshSingerDiscoverCard[];
};

const AtshSingerDiscover = ({ title, cards }: AtshSingerDiscoverProps) => {
  const { classes } = useAtshSingerStyles();

  if (!cards.length) {
    return null;
  }

  const items = cards.map((card) => ({
    title: card.title,
    subtitle: card.description,
    src: card.image,
    href: card.href,
    actionLabel: ATSH_SINGER_DISCOVER_ACTION_LABEL,
    alt: card.title,
    aspectRatio: "372 / 266",
  }));

  return (
    <Box className={classes.discoverSection} component="section">
      <ProductInfoSliderComponent title={title} items={items} itemsToShow={{ xs: 1, md: 2, lg: 3 }} />
    </Box>
  );
};

export default AtshSingerDiscover;
