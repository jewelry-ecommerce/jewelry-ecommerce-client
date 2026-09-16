import React from "react";
import { Stack } from "@mui/material";
import ProductSliderSkeletonComponent from "@/components/product/product-slider/product-slider-skeleton.component";
import ProductInfoSliderSkeletonComponent from "@/components/product/product-info/product-info-slider/product-info-slider-skeleton.component";
import ProductGallerySkeletonComponent from "@/components/product/product-gallery/product-gallery-skeleton.component";
import FormContactSkeletonComponent from "@/components/form-contact/form-contact-skeleton.component";
import BannerHeroSkeletonComponent from "./banner/banner-hero/banner-hero-skeleton.component";
import BannerCollectionSkeletonComponent from "./banner/banner-collection/banner-collection-skeleton.component";
import BannerCampaignSkeletonComponent from "./banner/banner-campaign/banner-campaign-skeleton.component";

const HomeSkeletonComponent = () => {
  return (
    <Stack spacing={{ xs: 4, md: 6 }}>
      <BannerHeroSkeletonComponent />
      <ProductSliderSkeletonComponent count={4} />
      <BannerCollectionSkeletonComponent />
      <ProductInfoSliderSkeletonComponent count={3} />
      <ProductGallerySkeletonComponent count={4} />
      <BannerCampaignSkeletonComponent count={2} />
      <FormContactSkeletonComponent />
    </Stack>
  );
};

export default HomeSkeletonComponent;
