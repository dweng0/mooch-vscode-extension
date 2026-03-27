import * as vscode from 'vscode';
import axios from 'axios';

export interface HintResult {
	answer: string;
	explanation: string;
}

export class MoochApiClient {
	private get baseUrl(): string {
		return vscode.workspace.getConfiguration('moochAnalyzer').get<string>('bridgeUrl', 'http://127.0.0.1:62544');
	}

	private get headers() {
		return {
			'Content-Type': 'application/json',
			'X-Mooch-Client': 'vscode-extension',
		};
	}

	/** Push the current file to Mooch so it appears in the dashboard. No AI call is made. */
	async syncCode(code: string, pageTitle: string, language: string): Promise<void> {
		try {
			await axios.post(
				`${this.baseUrl}/api/sync`,
				{ code, pageTitle, language },
				{ headers: this.headers, timeout: 5000 }
			);
		} catch (error) {
			if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
				// Mooch isn't running — silent, expected when app is closed
				return;
			}
			console.error('Mooch sync error:', error instanceof Error ? error.message : error);
		}
	}

	/** Keep-alive ping so Mooch doesn't think the extension disconnected. */
	async heartbeat(): Promise<void> {
		try {
			await axios.get(`${this.baseUrl}/health`, { headers: this.headers, timeout: 3000 });
		} catch {
			// silent — Mooch may not be running
		}
	}

	/** Ask Mooch to generate a hint for the current file. Returns answer + explanation. */
	async getHint(code: string, pageTitle: string, language: string, userContext?: string): Promise<HintResult | null> {
		try {
			const response = await axios.post<HintResult>(
				`${this.baseUrl}/api/hint`,
				{ code, pageTitle, language, userContext: userContext || undefined },
				{ headers: this.headers, timeout: 60000 }
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 503) {
				vscode.window.showWarningMessage('Mooch: no AI provider configured. Add an API key in Mooch settings.');
			}
			// All other errors (ECONNREFUSED, timeouts, etc.) are silent — user invoked this deliberately
			// so a missing response is self-explanatory
			return null;
		}
	}
}
