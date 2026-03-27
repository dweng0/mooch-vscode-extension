import * as vscode from 'vscode';

const STATE_KEY = 'mooch.interviewContext';

/** Returns the persisted interview context for the current workspace. */
export function getContext(state: vscode.Memento): string {
	return state.get<string>(STATE_KEY, '');
}

/** Opens (or reveals) the Mooch context panel where the user can type interview notes. */
export function openContextPanel(extensionContext: vscode.ExtensionContext): void {
	ContextPanel.createOrShow(extensionContext);
}

class ContextPanel {
	static current: ContextPanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private readonly extContext: vscode.ExtensionContext;

	static createOrShow(extContext: vscode.ExtensionContext) {
		if (ContextPanel.current) {
			ContextPanel.current.panel.reveal();
			return;
		}
		const panel = vscode.window.createWebviewPanel(
			'moochContext',
			'Mooch — Interview Context',
			vscode.ViewColumn.Beside,
			{ enableScripts: true, retainContextWhenHidden: true }
		);
		ContextPanel.current = new ContextPanel(panel, extContext);
	}

	private constructor(panel: vscode.WebviewPanel, extContext: vscode.ExtensionContext) {
		this.panel = panel;
		this.extContext = extContext;

		this.panel.webview.html = this.buildHtml(getContext(extContext.workspaceState));

		// Messages from the WebView → extension
		this.panel.webview.onDidReceiveMessage((msg) => {
			if (msg.type === 'save') {
				extContext.workspaceState.update(STATE_KEY, msg.value);
			}
		}, undefined, extContext.subscriptions);

		this.panel.onDidDispose(() => {
			ContextPanel.current = undefined;
		}, undefined, extContext.subscriptions);
	}

	private buildHtml(savedContext: string): string {
		const escaped = savedContext
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');

		return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
<title>Mooch Interview Context</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    gap: 10px;
  }

  h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-foreground);
    opacity: 0.8;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  p.hint {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
  }

  textarea {
    flex: 1;
    width: 100%;
    resize: none;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 4px;
    padding: 10px 12px;
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    line-height: 1.6;
    outline: none;
  }

  textarea:focus {
    border-color: var(--vscode-focusBorder);
  }

  textarea::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }

  .status {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    text-align: right;
    height: 14px;
    transition: opacity 0.4s;
  }
  .status.hidden { opacity: 0; }
</style>
</head>
<body>
<h2>Interview Context</h2>
<p class="hint">Describe the situation — the AI will use this when generating hints.</p>
<textarea id="ctx" placeholder="e.g. The interviewer will be asking me about fundamentals. This is a warm-up problem. Focus on clean code over optimal complexity.">${escaped}</textarea>
<div class="status hidden" id="status">Saved</div>
<script>
  const vscode = acquireVsCodeApi();
  const ta = document.getElementById('ctx');
  const status = document.getElementById('status');
  let debounce;

  ta.addEventListener('input', () => {
    clearTimeout(debounce);
    status.classList.add('hidden');
    debounce = setTimeout(() => {
      vscode.postMessage({ type: 'save', value: ta.value });
      status.textContent = 'Saved';
      status.classList.remove('hidden');
      setTimeout(() => status.classList.add('hidden'), 2000);
    }, 500);
  });
</script>
</body>
</html>`;
	}
}
