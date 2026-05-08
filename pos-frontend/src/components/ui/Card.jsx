import React from "react";

const Card = ({ as: Tag = "div", className = "", children, ...rest }) => (
  <Tag
    className={`bg-theme-surface border border-theme-border rounded-lg ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
