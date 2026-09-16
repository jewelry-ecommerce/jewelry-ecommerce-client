import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import useSWR from "swr";
import useStyles from "./footer.styles";
import { StackRowAlignStartJustBetween } from "@/components/styled/stack.style";
import { AppLink } from "..";
import { ServerSafeContent } from "@/components/server-safe-content/server-safe-content.component";
import { useLogoSrc, useTenantBrandName } from "@/components/providers.component";
import { CmsApi } from "@/utils/api";
import { buildFooterFallback, mapStorefrontFooter } from "./footer.util";

const Footer = () => {
  const logoSrc = useLogoSrc("FOOTER");
  const brandName = useTenantBrandName();
  const { classes, cx } = useStyles();
  const fallbackFooter = useMemo(() => buildFooterFallback(brandName), [brandName]);

  const { data: globalConfig } = useSWR("cms/storefront/global-config", () => CmsApi.getStorefrontGlobalConfig(), {
    shouldRetryOnError: false,
    fallbackData: { header: null, footer: fallbackFooter },
  });

  const cmsFooter = globalConfig?.footer ?? fallbackFooter;
  const footerView = useMemo(() => mapStorefrontFooter(cmsFooter ?? fallbackFooter), [cmsFooter, fallbackFooter]);

  return (
    <Box component="footer" className={classes.root}>
      <Box className={classes.logo}>
        <AppLink href="/">
          <Image src={logoSrc} alt={brandName} width={120} height={40} />
        </AppLink>
      </Box>

      <Box className={classes.gridContainer}>
        <Box className={cx(classes.column, classes.logoPC)}>
          <AppLink href="/">
            <Image
              src={logoSrc}
              alt={brandName}
              width={180}
              height={46}
              className={classes.footerLogoDesktop}
              style={{ height: 46, width: "auto" }}
            />
          </AppLink>
        </Box>

        {footerView.columns.map((section, index) => (
          <Box key={index} className={classes.column}>
            <Typography className={classes.columnTitle}>{section.title}</Typography>
            <Box className={classes.linkList}>
              {section.items.map((item, idx) => (
                <Box key={idx}>
                  {item.url ? (
                    <AppLink href={item.url} className={classes.linkItem}>
                      {item.label}
                    </AppLink>
                  ) : (
                    <Typography className={classes.linkItem}>{item.label}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box className={classes.divider} />

      <StackRowAlignStartJustBetween className={classes.bottomBar}>
        <ServerSafeContent component="div" className={classes.copyrightText} rawHtml={footerView.copyright} />

        <Box className={classes.socialAndCert}>
          <Box className={classes.socialIcons}>
            {footerView.socialIcons.map((icon, index) => (
              <AppLink key={index} href={icon.href} target="_blank" rel="noopener noreferrer" className={classes.socialIcon}>
                <Image src={icon.src} alt={icon.alt} width={25} height={25} />
              </AppLink>
            ))}
          </Box>
          {footerView.certificationImageUrl && (
            <AppLink href={footerView.certificationUrl || "#"} target="_blank" rel="noopener noreferrer">
              <Image src={footerView.certificationImageUrl} alt="certification" width={128} height={40} />
            </AppLink>
          )}
        </Box>
      </StackRowAlignStartJustBetween>
    </Box>
  );
};

export default Footer;
