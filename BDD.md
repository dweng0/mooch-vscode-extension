---
language: typescript
framework: react-vite
build_cmd: npm run build
test_cmd: npm test
lint_cmd: npm run lint
fmt_cmd: npm run format
birth_date: 2026-03-05
---

You must only write code and tests that meet the features and scenarios of this behaviour driven development document.

System: A VSCode extension that integrates with the Mooch application to analyze code files. The extension reads the currently open file in VSCode and sends it via the Mooch bridge (HTTP API at localhost:62544) to the Mooch application for analysis. The analysis happens silently in the background without user intervention, and results are processed internally by the extension. This extension operates independently from the browser extension and focuses on analyzing the current file in VSCode.

    Feature: Silent background analysis of current file
        As a developer using VSCode
        I want the extension to automatically analyze my current file in the background
        So that I can receive insights about my code without interrupting my workflow

        Background:
            Given the Mooch application is running and accessible via the bridge API at localhost:62544
            And the VSCode extension is installed and activated
            And the extension has permission to read the current file content

        Scenario: Extension analyzes current file when opened
            Given a file is opened in VSCode
            When the extension detects the file opening event
            Then the extension reads the current file content silently
            And sends the content to the Mooch bridge API at /api/analyze endpoint
            And includes the X-Mooch-Client header in the request
            And waits for the analysis response without showing notifications
            And processes the analysis results internally

        Scenario: Extension analyzes current file when saved
            Given a file is open and modified in VSCode
            When the file is saved
            Then the extension reads the updated file content silently
            And sends the content to the Mooch bridge API at /api/analyze endpoint
            And includes the X-Mooch-Client header in the request
            And waits for the analysis response without showing notifications
            And processes the analysis results internally

        Scenario: Extension analyzes current file when editor focus changes
            Given multiple files are open in VSCode
            When the user switches to a different editor tab
            Then the extension reads the newly focused file content silently
            And sends the content to the Mooch bridge API at /api/analyze endpoint
            And includes the X-Mooch-Client header in the request
            And waits for the analysis response without showing notifications
            And processes the analysis results internally

    Feature: Error handling during silent analysis
        As a developer using VSCode
        I want the extension to handle errors gracefully during analysis
        So that my workflow is not disrupted by error messages

        Scenario: Handle Mooch bridge API unavailability
            Given the Mooch application is not running
            When the extension attempts to send file content to the bridge API
            Then the extension logs the error internally
            And continues operating without showing error notifications to the user
            And retries the analysis when the bridge becomes available

        Scenario: Handle malformed analysis response
            Given the Mooch bridge returns a malformed response
            When the extension receives the response
            Then the extension handles the error gracefully
            And continues operating without showing error notifications to the user
            And logs the issue internally for debugging

    Feature: Configuration and privacy controls
        As a developer using VSCode
        I want to configure when and how the extension performs analysis
        So that I have control over my privacy and resource usage

        Scenario: Enable/disable automatic analysis
            Given the extension is installed
            When the user disables automatic analysis in extension settings
            Then the extension stops sending files to the bridge API
            And no analysis occurs when files are opened, saved, or focused

        Scenario: Configure analysis triggers
            Given the extension is installed
            When the user configures which events trigger analysis (onOpen, onSave, onFocus)
            Then the extension respects the configuration
            And only performs analysis on the specified events

    Feature: Independent operation from browser extension
        As a developer using VSCode
        I want the extension to operate independently from the browser extension
        So that I can use VSCode analysis without affecting browser extension functionality

        Scenario: Extension operates without browser extension
            Given the browser extension is not installed or not connected
            When the VSCode extension sends file content for analysis
            Then the extension successfully communicates with the Mooch bridge
            And analysis proceeds normally
            And the extension does not interfere with browser extension status indicators
