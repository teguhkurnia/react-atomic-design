// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { existsSync, mkdirSync, readFileSync, writeFile } from "fs"
import { dirname, join } from "path"

import * as vscode from "vscode"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const { workspaceFolders } = vscode.workspace

const getRootPath = () => {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No Work Space Opened")
    return
  }

  return workspaceFolders[0].uri.fsPath
}

const createFile = async (fileName: string, data: string = "") => {
  try {
    if (existsSync(fileName)) {
      const option = ["Replace", "Cancel"]

      await new Promise<void>((resolve, reject) => {
        vscode.window.showQuickPick(option).then((selectedOption) => {
          if (selectedOption === option[1]) reject({ message: "" })

          resolve()
        })
      })
    }

    if (!existsSync(dirname(fileName))) {
      mkdirSync(dirname(fileName), { recursive: true })
    }

    writeFile(fileName, data, async (error) => {
      if (error) {
        vscode.window.showErrorMessage(
          "Failed to create file: " + error.message
        )
      } else {
        const document = await vscode.workspace.openTextDocument(fileName)
        await vscode.window.showTextDocument(document)
        vscode.window.showInformationMessage(
          "File successfully created: " + fileName
        )
      }
    })
  } catch (error: any) {
    throw error
  }
}

const createComponentCommands = [
  {
    name: "createAtomComponent",
    filePlaceHolder: "MyAtomComponent",
  },
  {
    name: "createOrganismComponent",
    filePlaceHolder: "MyOrganismComponent",
  },
  {
    name: "createMoleculeComponent",
    filePlaceHolder: "MyMoleculeComponent",
  },
  {
    name: "createLayoutComponent",
    filePlaceHolder: "MyLayoutComponent",
  },
]

export function activate(context: vscode.ExtensionContext) {
  // push the create component Commands
  createComponentCommands.forEach((command) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `react-atomic-design.${command.name}`,
        () => {
          const config = vscode.workspace.getConfiguration(
            "react-atomic-design"
          )

          const getBasePath = config.get<string>("basePath")

          const basePath =
            getBasePath && getBasePath !== "" ? getBasePath : "src"
          const atomsFolderPath =
            config.get<string>("atomsFolderPath") ?? "components/atoms"
          const organismsFolderPath =
            config.get<string>("organismsFolderPath") ?? "components/organisms"
          const moleculesFolderPath =
            config.get<string>("moleculesFolderPath") ?? "components/molecules"
          const layoutFolderPath =
            config.get<string>("layoutFolderPath") ?? "components/layout"

          const getFolderPath = () => {
            switch (command.name) {
              case "createAtomComponent":
                return atomsFolderPath
              case "createOrganismComponent":
                return organismsFolderPath
              case "createMoleculeComponent":
                return moleculesFolderPath
              case "createLayoutComponent":
                return layoutFolderPath

              default:
                return ""
            }
          }

          const rootPath = getRootPath()

          if (!rootPath) return

          const folderPath = join(rootPath, basePath, getFolderPath())

          vscode.window
            .showInputBox({
              prompt: "Component Name",
              placeHolder: command.filePlaceHolder,
            })
            .then((fileName) => {
              if (fileName) {
                try {
                  if (existsSync(join(rootPath, "tsconfig.json"))) {
                    const template = readFileSync(
                      join(
                        context.extensionPath,
                        "src/text/react-typescript-function-component.txt"
                      )
                    )

                    createFile(
                      join(folderPath, fileName + ".tsx"),
                      template
                        .toString()
                        .replace(new RegExp("{fileName}", "g"), fileName)
                    )
                  } else {
                    const template = readFileSync(
                      join(
                        context.extensionPath,
                        "src/text/react-javascript-function-component.txt"
                      )
                    )

                    createFile(
                      join(folderPath, fileName + ".jsx"),
                      template
                        .toString()
                        .replace(new RegExp("{fileName}", "g"), fileName)
                    )
                  }
                } catch (error: any) {
                  vscode.window.showErrorMessage(
                    "Failed to create file: " + error.message
                  )
                }
              }
            })
        }
      )
    )
  })
}

// This method is called when your extension is deactivated
export function deactivate() {}
