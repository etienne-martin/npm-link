export const help = () => {
  console.log(`-----------------------------
Usage: npm-link <destination>
-----------------------------
  
destination: a project to which you want to mirror your package
`);
  process.exit(0);
};
