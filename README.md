# npm-link

An symlink-free alternative to `npm link` and `yarn link` to mirror packages during development.

## Getting Started

### Installation

To install npm-link globally, run:

```bash
npm install -g npm-link
```

### Usage

Navigate to the root folder of the package you want to mirror:
  
```bash
cd my-package
```

Then run `npm-link`, where `<destination>` is a project to which you want to mirror your package:

```bash
npm-link <destination>
```
