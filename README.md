# SSH Manager for Visual Studio Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/YourPublisherName.ssh-manager)](https://marketplace.visualstudio.com/items?itemName=YourPublisherName.ssh-manager)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/YourPublisherName.ssh-manager)](https://marketplace.visualstudio.com/items?itemName=YourPublisherName.ssh-manager)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/YourPublisherName.ssh-manager)](https://marketplace.visualstudio.com/items?itemName=YourPublisherName.ssh-manager)
[![License](https://img.shields.io/github/license/and-ri/vscode-ssh-manager)](https://github.com/and-ri/vscode-ssh-manager/blob/main/LICENSE)

SSH Manager is a Visual Studio Code extension that simplifies the management and usage of SSH connections directly within your IDE.

## Features

- **Organize SSH Connections**: Create sections to group your SSH connections logically.
- **Easy Connection Management**: Add, edit, and remove SSH connections with a user-friendly interface.
- **Quick Connect**: Connect to your saved SSH servers with a single click.
- **Secure Storage**: Your SSH credentials are stored securely using VS Code's built-in secret storage.
- **Custom SSH Commands**: Supports custom SSH commands and port specifications.

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (or `Cmd+P` on macOS) to open the Quick Open dialog
3. Type `ext install YourPublisherName.ssh-manager` and press Enter

Alternatively, you can install the extension directly from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=YourPublisherName.ssh-manager).

## Usage

### Managing SSH Connections

1. Click on the SSH Manager icon in the Activity Bar to open the SSH Manager view.
2. Use the "Add Section" button to create a new group for your connections.
3. Right-click on a section and select "Add Server" to create a new SSH connection.
4. Fill in the server details in the form that appears.

### Connecting to a Server

- Click on a server in the SSH Manager view to connect.
- A new terminal will open with the SSH connection established.

### Editing and Removing Connections

- Right-click on a server or section to access options for editing or removing.

## Configuration

SSH Manager stores your connections in VS Code's global settings. You can manually edit these settings in the `settings.json` file:

```json
"sshManager.savedConnections": [
  {
    "label": "My Section",
    "servers": [
      {
        "label": "My Server",
        "host": "example.com",
        "port": 22,
        "username": "user"
      }
    ]
  }
]
```

## Security

- Passwords are stored securely using VS Code's secret storage.
- We recommend using SSH keys instead of passwords for enhanced security.
- Always be cautious when storing sensitive information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any problems or have suggestions, please [open an issue](https://github.com/and-ri/vscode-ssh-manager/issues) on our GitHub repository.

---

Enjoy using SSH Manager! We hope it makes your SSH workflow smoother and more efficient.