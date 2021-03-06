import * as core from '@actions/core';
import * as exec from '@actions/exec';
const tc = require('@actions/tool-cache');

export class DacpacDeployer {
    connectionString: string;
    dacpac: string;
    additionalArguments: string;
    workspacePath: string;

    constructor() {

        // get all the inputs
        this.connectionString = core.getInput('connectionString');
        this.dacpac = core.getInput('dacpac');
        this.additionalArguments = core.getInput('additionalArguments');

        // get workspace path from environment variable
        this.workspacePath = <string>process.env.GITHUB_WORKSPACE;
    }

    async deploy() {
        // download sqlpackage.exe 
        const sqlPackageDownloadPath = await tc.downloadTool('https://abelsharedblob.blob.core.windows.net/abelblog/sqlpackage.exe.zip');
        // unzip it
        const sqlPackageExtractedFolder = await tc.extractZip(sqlPackageDownloadPath, this.workspacePath + "\\sqlpackageexe");
        
        // add sql package.exe to path
        core.addPath(sqlPackageExtractedFolder);

        // add sql package.exe to path
        //core.addPath('C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Enterprise\\Common7\\IDE\\Extensions\\Microsoft\\SQLDB\\DAC\\150');

        // getting input variables and workspace path to create the command line command string
        console.log("updating database...");
        console.log("connectionString: " + this.connectionString);
        console.log("dacpac: " + this.dacpac);
        console.log("additionalArguments: " + this.additionalArguments);
        console.log("workspace: " + this.workspacePath);
        console.log("");

        // create command string from all the inputs and workspace path
        // let commandString = "sqlpackage.exe /Action:Publish /SourceFile:\"" + this.workspacePath + "\\" + this.dacpac + "\" /TargetConnectionString:\"" + this.connectionString + "\" " + this.additionalArguments;
        let commandString = "sqlpackage.exe /Action:Publish /SourceFile:\"" + this.workspacePath + "\\" + this.dacpac + "\" /TargetConnectionString:\"" + this.connectionString + "\" " + this.additionalArguments;
        console.log("command string: " + commandString);
        console.log("");

        // call sql package.exe
        exec.exec(commandString)
            .then(r => {
                console.log(r);
                console.log("done updating database");
            })
            .catch(e => {
                console.log("done updating database")  
                core.setFailed(`Action failed with ${e}`);
            });

    }
}