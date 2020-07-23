import minimist from "minimist";

const {
  _: [dest]
} = minimist(process.argv.slice(2));

if (!dest) {
  console.log(`-----------------------------
Usage: npm-link <package-folder> <installation-folder>
-----------------------------

Package folder: a path to the package you want to mirror
Installation folder: a path to a project to which you want to mirror your package
`);
  process.exit(0);
}
