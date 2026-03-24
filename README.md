# Mooch Code Analyzer

A VSCode extension that integrates with Mooch to analyze code files in the background. The extension reads the currently open file in VSCode and sends it via the Mooch bridge to the Mooch application for analysis. The analysis happens silently in the background without user intervention.

## Important Note: VSCode vs Browser Extension

This extension operates independently from the Mooch browser extension. The browser extension is designed to work with coding challenge websites (LeetCode, HackerRank, etc.) and connects to the "Code Interview" screen in Mooch. This VSCode extension focuses on analyzing the current file in your editor and does not affect the browser extension's functionality or status indicators.

## Features

- Automatically analyzes code files when opened, saved, or focused
- Silent background processing without interrupting workflow
- Configurable analysis triggers
- Error handling for Mooch bridge connectivity issues
- Operates independently from browser extension

## Prerequisites

- VSCode version 1.74 or higher
- Mooch application running and accessible via the bridge API at `http://127.0.0.1:62544`

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Compile the extension: `npm run compile`
4. Press F5 to open a new window with the extension loaded

## Configuration

The extension provides the following configuration options:

- `moochAnalyzer.enabled`: Enable automatic analysis of current file (default: true)
- `moochAnalyzer.events`: Events that trigger code analysis (default: ["onOpen", "onSave"])
- `moochAnalyzer.bridgeUrl`: URL of the Mooch bridge API (default: "http://127.0.0.1:62544")

To configure these options:
1. Open VSCode settings (Ctrl+, or Cmd+,)
2. Search for "Mooch Code Analyzer"
3. Modify the settings as needed

## Development

- Run `npm run compile` to compile the extension
- Run `npm run watch` to watch for changes and compile automatically
- Run `npm run test` to run tests
- Run `npm run lint` to lint the code

## How to Publish

### Prerequisites for Publishing

Before publishing your extension, you'll need to:

1. Create a Microsoft Partner Center account at https://partner.microsoft.com/dashboard
2. Create a publisher account for your extensions
3. Install the VSCE (Visual Studio Code Extensions) command-line tool:

```bash
npm install -g vsce
```

### Steps to Package and Publish

1. **Login to your publisher account:**
   ```bash
   vsce login <publisher-name>
   ```
   Replace `<publisher-name>` with your actual publisher name from the Partner Center.

2. **Package the extension:**
   ```bash
   vsce package
   ```
   This creates a `.vsix` file that contains your packaged extension.

3. **Publish directly to the marketplace:**
   ```bash
   vsce publish
   ```
   This uploads and publishes your extension to the VSCode marketplace.

### Alternative: Manual Installation

If you want to share the extension without publishing to the marketplace:

1. Package the extension: `vsce package`
2. Share the generated `.vsix` file with others
3. Users can install it manually in VSCode:
   - Open VSCode
   - Go to Extensions view (Ctrl+Shift+X)
   - Click the "..." menu and select "Install from VSIX..."
   - Select the `.vsix` file

### Verification Before Publishing

Before publishing, make sure to:

1. Update the version in `package.json`
2. Test the extension thoroughly
3. Add proper documentation and screenshots to the README
4. Ensure all dependencies are properly declared
5. Check that your extension follows VSCode extension guidelines

## License

MIT