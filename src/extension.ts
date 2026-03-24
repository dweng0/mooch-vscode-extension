import * as vscode from 'vscode';
import { MoochApiClient } from './moochApiClient';

export function activate(context: vscode.ExtensionContext) {
	console.log('Mooch Code Analyzer extension is now active!');

	// Initialize the API client
	const apiClient = new MoochApiClient();

	// Register a disposable to clean up on deactivation
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document) => {
			handleDocumentEvent(document, 'onOpen', apiClient);
		}),
		vscode.workspace.onDidSaveTextDocument((document) => {
			handleDocumentEvent(document, 'onSave', apiClient);
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && editor.document) {
				handleDocumentEvent(editor.document, 'onFocus', apiClient);
			}
		})
	);

	console.log('Mooch Code Analyzer event listeners registered');
}

function handleDocumentEvent(document: vscode.TextDocument, eventType: string, apiClient: MoochApiClient) {
	// Check if the extension is enabled
	const isEnabled = vscode.workspace.getConfiguration('moochAnalyzer').get<boolean>('enabled', true);
	if (!isEnabled) {
		return;
	}

	// Check if the current event type is enabled in configuration
	const enabledEvents = vscode.workspace.getConfiguration('moochAnalyzer').get<string[]>('events', ['onOpen', 'onSave']);
	if (!enabledEvents.includes(eventType)) {
		return;
	}

	// Skip analysis for certain file types or untitled documents
	if (document.isUntitled || document.languageId === 'output' || document.fileName.startsWith('extension-output')) {
		return;
	}

	// Perform analysis
	performAnalysis(document, apiClient);
}

async function performAnalysis(document: vscode.TextDocument, apiClient: MoochApiClient) {
	try {
		const content = document.getText();
		const fileName = document.fileName;
		
		console.log(`Analyzing file: ${fileName}`);
		
		// Send the file content to Mooch bridge for analysis
		await apiClient.analyzeCode(content, fileName);
		
		console.log(`Analysis completed for: ${fileName}`);
	} catch (error) {
		console.error(`Error analyzing file ${document.fileName}:`, error);
		// Don't show error notifications to keep the analysis silent
	}
}

export function deactivate() {
	console.log('Mooch Code Analyzer extension deactivated');
}