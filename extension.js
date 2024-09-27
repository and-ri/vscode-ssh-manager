const vscode = require('vscode');

function activate(context) {
    const sshManagerProvider = new SshManagerProvider(context);
    vscode.window.registerTreeDataProvider('ssh-manager-view', sshManagerProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('ssh-manager.addSection', () => sshManagerProvider.addSection()),
        vscode.commands.registerCommand('ssh-manager.removeSection', (section) => sshManagerProvider.removeSection(section)),
        vscode.commands.registerCommand('ssh-manager.renameSection', (section) => sshManagerProvider.renameSection(section)),
        vscode.commands.registerCommand('ssh-manager.addServer', (section) => sshManagerProvider.addServer(section)),
        vscode.commands.registerCommand('ssh-manager.removeServer', (server) => sshManagerProvider.removeServer(server)),
        vscode.commands.registerCommand('ssh-manager.editServer', (server) => sshManagerProvider.editServer(server)),
        vscode.commands.registerCommand('ssh-manager.connectToServer', (server) => sshManagerProvider.connectToServer(server))
    );
}

class SshManagerProvider {
    constructor(context) {
        this.sections = [];
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.context = context;
        this.loadFromSettings();
    }

    loadFromSettings() {
        const config = vscode.workspace.getConfiguration('sshManager');
        const savedData = config.get('savedConnections', []);
        this.sections = savedData.map(section => {
            const newSection = new Section(section.label);
            newSection.servers = section.servers.map(server => 
                new Server(server.label, server.host, server.port, server.username, server.password)
            );
            return newSection;
        });
        this.refresh();
    }

    saveToSettings() {
        const config = vscode.workspace.getConfiguration('sshManager');
        const dataToSave = this.sections.map(section => ({
            label: section.label,
            servers: section.servers.map(server => ({
                label: server.label,
                host: server.host,
                port: server.port,
                username: server.username,
                password: server.password
            }))
        }));
        config.update('savedConnections', dataToSave, vscode.ConfigurationTarget.Global);
    }

    refresh() {
        this._onDidChangeTreeData.fire();
        this.saveToSettings();
    }

    addSection() {
        vscode.window.showInputBox({ prompt: 'Enter new section name' }).then(name => {
            if (name) {
                this.sections.push(new Section(name));
                this.refresh();
            }
        });
    }

    removeSection(section) {
        this.sections = this.sections.filter(s => s !== section);
        this.refresh();
    }

    renameSection(section) {
        vscode.window.showInputBox({ prompt: 'Enter new section name', value: section.label }).then(newName => {
            if (newName) {
                section.label = newName;
                this.refresh();
            }
        });
    }

    addServer(section) {
        this.showServerForm(section);
    }

    removeServer(server) {
        server.parent.servers = server.parent.servers.filter(s => s !== server);
        this.refresh();
    }

    editServer(server) {
        this.showServerForm(server.parent, server);
    }

    showServerForm(section, server = null) {
        const panel = vscode.window.createWebviewPanel(
            'serverForm',
            server ? 'Edit Server' : 'Add Server',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = this.getServerFormHtml(server);

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'saveServer':
                        if (server) {
                            server.label = message.name;
                            server.host = message.host;
                            server.port = parseInt(message.port) || 22;
                            server.username = message.username;
                            server.password = message.password;
                            server.tooltip = `${message.name} (${message.host}:${message.port})`;
                            server.description = `${message.username}@${message.host}:${message.port}`;
                        } else {
                            section.addServer(new Server(message.name, message.host, parseInt(message.port) || 22, message.username, message.password));
                        }
                        this.refresh();
                        panel.dispose();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    getServerFormHtml(server = null) {
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${server ? 'Edit Server' : 'Add Server'}</title>
				<style>
					body { 
						font-family: var(--vscode-font-family); 
						color: var(--vscode-editor-foreground); 
						background-color: var(--vscode-editor-background); 
						padding: 16px;
						margin: 0;
						box-sizing: border-box;
					}
					*, *:before, *:after {
						box-sizing: inherit;
					}
					h1 {
						color: var(--vscode-editor-foreground);
					}
					label {
						display: block;
						margin-bottom: 5px;
						color: var(--vscode-editor-foreground);
					}
					input, button {
						width: 100%; 
						padding: 8px; 
						margin-bottom: 10px; 
						border: 1px solid var(--vscode-editorWidget-border); 
						background-color: var(--vscode-input-background); 
						color: var(--vscode-input-foreground); 
						border-radius: 4px;
					}
					input:focus {
						border-color: var(--vscode-inputOption-activeBorder); 
						outline: none;
					}
					button {
						background-color: var(--vscode-button-background); 
						color: var(--vscode-button-foreground);
						cursor: pointer;
						border: none;
					}
					button:hover {
						background-color: var(--vscode-button-hoverBackground);
					}
					button:focus {
						outline: 1px solid var(--vscode-button-hoverBackground);
					}
				</style>
			</head>
			<body>
				<h1>${server ? 'Edit Server' : 'Add Server'}</h1>
				<form id="serverForm">
					<label for="name">Server Name</label>
					<input type="text" id="name" placeholder="Server Name" value="${server ? server.label : ''}" required>
					<label for="host">Host</label>
					<input type="text" id="host" placeholder="Host" value="${server ? server.host : ''}" required>
					<label for="port">Port</label>
					<input type="number" id="port" placeholder="Port" value="${server ? server.port : '22'}" required>
					<label for="username">Username</label>
					<input type="text" id="username" placeholder="Username" value="${server ? server.username : ''}" required>
					<label for="password">Password</label>
					<input type="password" id="password" placeholder="Password" value="${server ? server.password : ''}">
					<button type="submit">Save</button>
				</form>
				<script>
					const vscode = acquireVsCodeApi();
					document.getElementById('serverForm').addEventListener('submit', (e) => {
						e.preventDefault();
						vscode.postMessage({
							command: 'saveServer',
							name: document.getElementById('name').value,
							host: document.getElementById('host').value,
							port: document.getElementById('port').value,
							username: document.getElementById('username').value,
							password: document.getElementById('password').value
						});
					});
				</script>
			</body>
			</html>
		`;
	}
	

    connectToServer(server) {
        const terminal = vscode.window.createTerminal(`SSH: ${server.label}`);
        terminal.sendText(`ssh ${server.username}@${server.host} -p ${server.port}`);
        terminal.show();

        if (server.password) {
            setTimeout(() => {
                terminal.sendText(server.password);
            }, 2000);
        }
    }

    getTreeItem(element) {
        if (element instanceof Server) {
            element.command = {
                command: 'ssh-manager.connectToServer',
                title: 'Connect',
                arguments: [element]
            };
        }
        return element;
    }

    getChildren(element) {
        if (!element) {
            return this.sections;
        }
        if (element instanceof Section) {
            return element.getServers();
        }
        return [];
    }
}

class Section extends vscode.TreeItem {
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.servers = [];
        this.contextValue = 'section';
    }

    addServer(server) {
        this.servers.push(server);
        server.parent = this;
    }

    getServers() {
        return this.servers;
    }
}

class Server extends vscode.TreeItem {
    constructor(label, host, port = 22, username = '', password = '') {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.contextValue = 'server';
        this.tooltip = `${label} (${host}:${port})`;
        this.description = `${username}@${host}:${port}`;
        this.parent = null;
        this.command = {
            command: 'ssh-manager.connectToServer',
            title: 'Connect',
            arguments: [this]
        };
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};