import * as path from 'path';
import * as vscode from 'vscode';
import { MoochApiClient } from './moochApiClient';
import { getContext, openContextPanel } from './contextPanel';

const HEARTBEAT_INTERVAL = 10_000;

export function activate(context: vscode.ExtensionContext) {
	const apiClient = new MoochApiClient();
	const output = vscode.window.createOutputChannel('Mooch');

	// ── Heartbeat ────────────────────────────────────────────────────────────
	const heartbeatTimer = setInterval(() => apiClient.heartbeat(), HEARTBEAT_INTERVAL);
	context.subscriptions.push({ dispose: () => clearInterval(heartbeatTimer) });

	// ── File events ──────────────────────────────────────────────────────────
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((doc) => syncDocument(doc, 'onOpen', apiClient)),
		vscode.workspace.onDidSaveTextDocument((doc) => {
			syncDocument(doc, 'onSave', apiClient);
			autoHint(doc, apiClient, getContext(context.workspaceState));
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) { syncDocument(editor.document, 'onFocus', apiClient); }
		}),
	);

	// ── Commands ─────────────────────────────────────────────────────────────
	context.subscriptions.push(
		// Get Hint — generates a hint and shows it in the output panel
		vscode.commands.registerCommand('moochAnalyzer.getHint', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage('Open a file first to get a hint.');
				return;
			}
			const doc = editor.document;
			if (shouldSkip(doc)) {
				vscode.window.showInformationMessage('Cannot get a hint for this file type.');
				return;
			}

			const result = await apiClient.getHint(
				doc.getText(),
				path.basename(doc.fileName),
				doc.languageId,
				getContext(context.workspaceState),
			);
			if (!result) { return; }

			output.clear();
			output.appendLine(`=== Mooch Hint — ${path.basename(doc.fileName)} ===\n`);
			output.appendLine('--- ANSWER ---');
			output.appendLine(result.answer);
			if (result.explanation) {
				output.appendLine('\n--- WHY THIS WORKS ---');
				output.appendLine(result.explanation);
			}
			output.show(true);
		}),

		// Set Context — opens the interview context panel
		vscode.commands.registerCommand('moochAnalyzer.setContext', () => {
			openContextPanel(context);
		}),
	);

	// Sync whatever is already open on activation
	if (vscode.window.activeTextEditor) {
		syncDocument(vscode.window.activeTextEditor.document, 'onFocus', apiClient);
	}
}

function shouldSkip(doc: vscode.TextDocument): boolean {
	return doc.isUntitled || doc.languageId === 'output' || doc.fileName.startsWith('extension-output');
}

function syncDocument(doc: vscode.TextDocument, eventType: string, apiClient: MoochApiClient) {
	const config = vscode.workspace.getConfiguration('moochAnalyzer');
	if (!config.get<boolean>('enabled', true)) { return; }
	const enabledEvents = config.get<string[]>('events', ['onOpen', 'onSave']);
	if (!enabledEvents.includes(eventType)) { return; }
	if (shouldSkip(doc)) { return; }
	apiClient.syncCode(doc.getText(), path.basename(doc.fileName), doc.languageId);
}

function autoHint(doc: vscode.TextDocument, apiClient: MoochApiClient, userContext: string) {
	const config = vscode.workspace.getConfiguration('moochAnalyzer');
	if (!config.get<boolean>('enabled', true)) { return; }
	if (!config.get<boolean>('autoHintOnSave', true)) { return; }
	if (shouldSkip(doc)) { return; }
	apiClient.getHint(doc.getText(), path.basename(doc.fileName), doc.languageId, userContext);
}

export function deactivate() {}
