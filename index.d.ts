declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "@theme/*";

declare module "@site/src/components/*";

declare module "@docusaurus/*";
