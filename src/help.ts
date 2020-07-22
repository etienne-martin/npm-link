import minimist from "minimist";

const {
  _: [dest]
} = minimist(process.argv.slice(2));

if (!dest) {
  console.log(`-----------------------------
Usage: npm-link <destination>
-----------------------------
  
destination: a project to which you want to mirror your package
`);
  process.exit(0);
}
