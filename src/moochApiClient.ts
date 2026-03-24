import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

export interface AnalysisResult {
	analysis: string;
}

export class MoochApiClient {
	private baseUrl: string;

	constructor() {
		this.baseUrl = vscode.workspace.getConfiguration('moochAnalyzer').get<string>('bridgeUrl', 'http://127.0.0.1:62544');
	}

	async analyzeCode(code: string, fileName?: string): Promise<AnalysisResult | null> {
		try {
			// Get the updated base URL in case it changed in settings
			this.baseUrl = vscode.workspace.getConfiguration('moochAnalyzer').get<string>('bridgeUrl', 'http://127.0.0.1:62544');
			
			const response: AxiosResponse<AnalysisResult> = await axios.post(
				`${this.baseUrl}/api/analyze`,
				{
					code: code,
					context: fileName ? `File: ${fileName}` : undefined
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'X-Mooch-Client': 'vscode-extension'
					},
					timeout: 30000 // 30 second timeout
				}
			);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// Log the error but don't show notifications to keep analysis silent
				console.error(`Mooch API error: ${error.response?.status} - ${error.response?.data || error.message}`);
				
				// Handle specific error cases
				if (error.code === 'ECONNREFUSED') {
					console.error('Mooch bridge is not accessible. Is the Mooch application running?');
				} else if (error.code === 'ETIMEDOUT') {
					console.error('Mooch API request timed out');
				}
			} else {
				console.error('Unexpected error during analysis:', error);
			}
			
			return null;
		}
	}
}