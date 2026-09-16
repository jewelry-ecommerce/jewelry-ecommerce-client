import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { Plus, Minus } from "@untitledui/icons";
import { AccordionProps } from "./accordion.interface";
import useStyles from "./accordion.styles";

export const AccordionComponent = ({
  title,
  children,
  expanded: expandedProp,
  defaultExpanded,
  onChange: onChangeProp,
  sx,
  summarySx,
  detailsSx,
  expandIcon,
  disableGutters = true,
  elevation = 0,
}: AccordionProps) => {
  const { classes, cx } = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded || false);

  const isControlled = expandedProp !== undefined;
  const currentExpanded = isControlled ? expandedProp : isExpanded;

  const handleChange = (event: React.SyntheticEvent, expanded: boolean) => {
    if (!isControlled) {
      setIsExpanded(expanded);
    }
    if (onChangeProp) {
      onChangeProp(event, expanded);
    }
  };

  return (
    <Accordion
      expanded={currentExpanded}
      defaultExpanded={defaultExpanded}
      onChange={handleChange}
      elevation={elevation}
      disableGutters={disableGutters}
      className={cx(classes.root)}
      sx={sx}
    >
      <AccordionSummary
        expandIcon={expandIcon || (currentExpanded ? <Minus size={20} color="#000000" /> : <Plus size={20} color="#000000" />)}
        className={cx(classes.summary)}
        sx={summarySx}
      >
        {typeof title === "string" ? <Typography className={cx(classes.title)}>{title}</Typography> : title}
      </AccordionSummary>

      <AccordionDetails className={cx(classes.details)} sx={detailsSx}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default AccordionComponent;
